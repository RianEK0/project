import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../config/env.js";
import { getClient } from "../config/db.js";

function canonicalize(value) {
  if (value === null || value === undefined) return "null";
  if (["boolean", "number"].includes(typeof value)) return JSON.stringify(value);
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(",")}}`;
}

function signingKeys(keyId) {
  const keys = [];
  if (keyId === env.auditSigningKeyId) keys.push(env.auditSigningKey);
  const previous = String(env.auditPreviousSigningKeys || "")
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const separator = entry.indexOf("=");
      return separator > 0 ? [entry.slice(0, separator), entry.slice(separator + 1)] : [];
    })
    .filter(([storedId, key]) => storedId === keyId && key)
    .map(([, key]) => key);
  return [...new Set([...keys, ...previous].filter(Boolean))];
}

function entrySignature({ previousHash, userId, action, entity, entityId, metadata, createdAt, key }) {
  return createHmac("sha256", key)
    .update(canonicalize({
      version: 1,
      previousHash: previousHash || null,
      userId: userId || null,
      action,
      entity,
      entityId: entityId || null,
      metadata: metadata || {},
      createdAt: new Date(createdAt).toISOString()
    }))
    .digest("hex");
}

export async function appendAuditLog(client, { userId, action, entity, entityId = null, metadata = {} }) {
  await client.query("SELECT pg_advisory_xact_lock(742112045)");
  const previous = await client.query(
    "SELECT entry_hash FROM audit_logs WHERE entry_hash IS NOT NULL ORDER BY id DESC LIMIT 1"
  );
  const previousHash = previous.rows[0]?.entry_hash?.trim() || null;
  const createdAt = new Date();
  const entryHash = entrySignature({
    previousHash,
    userId,
    action,
    entity,
    entityId,
    metadata,
    createdAt,
    key: env.auditSigningKey
  });
  const result = await client.query(
    `INSERT INTO audit_logs
       (user_id, action, entity, entity_id, metadata, previous_hash, entry_hash, signing_key_id, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, entry_hash`,
    [userId || null, action, entity, entityId, metadata, previousHash, entryHash, env.auditSigningKeyId, createdAt]
  );
  return result.rows[0];
}

export async function logActivity({ userId, action, entity, entityId = null, metadata = {} }) {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const result = await appendAuditLog(client, { userId, action, entity, entityId, metadata });
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function verifyAuditChain() {
  const client = await getClient();
  let expectedPrevious = null;
  let signed = 0;
  let legacyUnsigned = 0;
  let lastId = 0;
  let total = 0;
  let failure = null;

  try {
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    total = Number((await client.query("SELECT COUNT(*)::bigint AS total FROM audit_logs")).rows[0].total);

    while (!failure) {
      const batch = await client.query(
        `SELECT id, user_id, action, entity, entity_id, metadata, previous_hash,
                entry_hash, signing_key_id, created_at
         FROM audit_logs WHERE id > $1 ORDER BY id ASC LIMIT 2000`,
        [lastId]
      );
      if (!batch.rows.length) break;

      for (const row of batch.rows) {
        lastId = row.id;
        if (!row.entry_hash) {
          if (signed > 0) {
            failure = { brokenAtId: row.id, reason: "unsigned_entry_after_chain_started" };
            break;
          }
          legacyUnsigned += 1;
          continue;
        }

        signed += 1;
        const keys = signingKeys(row.signing_key_id);
        if (!keys.length) {
          failure = { brokenAtId: row.id, reason: "signing_key_unavailable" };
          break;
        }
        if ((row.previous_hash?.trim() || null) !== expectedPrevious) {
          failure = { brokenAtId: row.id, reason: "previous_hash_mismatch" };
          break;
        }
        const actualBuffer = Buffer.from(row.entry_hash.trim(), "hex");
        const signatureMatches = keys.some((key) => {
          const expected = entrySignature({
            previousHash: expectedPrevious,
            userId: row.user_id,
            action: row.action,
            entity: row.entity,
            entityId: row.entity_id,
            metadata: row.metadata,
            createdAt: row.created_at,
            key
          });
          const expectedBuffer = Buffer.from(expected, "hex");
          return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
        });
        if (!signatureMatches) {
          failure = { brokenAtId: row.id, reason: "entry_hash_mismatch" };
          break;
        }
        expectedPrevious = row.entry_hash.trim();
      }
    }

    await client.query("COMMIT");
    if (failure) {
      return { valid: false, protected: false, ...failure, total, signed, legacyUnsigned };
    }
    return {
      valid: true,
      protected: signed > 0,
      total,
      signed,
      legacyUnsigned,
      headHash: expectedPrevious
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export const auditTestUtils = { canonicalize, entrySignature };
