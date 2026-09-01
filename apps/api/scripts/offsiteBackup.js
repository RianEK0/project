import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../src/config/env.js";
import { getClient, pool } from "../src/config/db.js";
import { encryptBackupPayload } from "../src/services/backupEncryption.js";
import { encryptEnvelope, parseEncryptionKey } from "../src/services/cryptoEnvelope.js";
import { exportBackup } from "../src/services/systemBackup.js";

const bucket = String(process.env.BACKUP_S3_BUCKET || "").trim();
const region = String(process.env.BACKUP_S3_REGION || "ap-southeast-1").trim();
const endpoint = String(process.env.BACKUP_S3_ENDPOINT || "").trim();
const basePrefix = String(process.env.BACKUP_S3_PREFIX || "sipadi").replace(/^\/+|\/+$/g, "");
const retentionDays = Math.max(0, Number(process.env.BACKUP_S3_OBJECT_LOCK_DAYS || 0));

if (!bucket) throw new Error("BACKUP_S3_BUCKET wajib diisi");

const s3 = new S3Client({
  region,
  ...(endpoint ? { endpoint, forcePathStyle: true } : {})
});
const backupKey = parseEncryptionKey(env.backupEncryptionKey, "BACKUP_ENCRYPTION_KEY");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const snapshotPrefix = `${basePrefix}/snapshots/${timestamp}`;
const objectLock = retentionDays > 0
  ? {
      ObjectLockMode: "GOVERNANCE",
      ObjectLockRetainUntilDate: new Date(Date.now() + retentionDays * 86400000)
    }
  : {};

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function putEncryptedObject(key, body, metadata = {}) {
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: "application/octet-stream",
    ServerSideEncryption: "AES256",
    Metadata: { sha256: sha256(body), ...metadata },
    ...objectLock
  }));
}

function encryptFile(buffer, relativeName) {
  return Buffer.from(JSON.stringify({
    app: "SIPADI",
    format: "encrypted-file",
    version: 1,
    source: relativeName,
    encryption: encryptEnvelope(buffer, {
      key: backupKey,
      keyId: env.backupEncryptionKeyId,
      aad: `sipadi:offsite-file:v1:${relativeName}`
    })
  }));
}

async function main() {
  const client = await getClient();
  const manifest = {
    app: "SIPADI",
    version: 1,
    createdAt: new Date().toISOString(),
    database: null,
    files: []
  };

  try {
    const database = encryptBackupPayload(await exportBackup(client));
    const dbKey = `${snapshotPrefix}/database.sipadi`;
    await putEncryptedObject(dbKey, database, { kind: "database" });
    manifest.database = { key: dbKey, bytes: database.length, sha256: sha256(database) };

    const uploadDirectory = path.resolve(process.cwd(), env.uploadDir);
    const entries = await fs.readdir(uploadDirectory, { withFileTypes: true }).catch((error) => {
      if (error.code === "ENOENT") return [];
      throw error;
    });

    for (const entry of entries) {
      if (!entry.isFile() || entry.isSymbolicLink()) continue;
      const sourcePath = path.join(uploadDirectory, entry.name);
      const plaintext = await fs.readFile(sourcePath);
      const encrypted = encryptFile(plaintext, entry.name);
      const key = `${snapshotPrefix}/uploads/${entry.name}.sipadi`;
      await putEncryptedObject(key, encrypted, { kind: "archive-file" });
      manifest.files.push({ key, source: entry.name, bytes: plaintext.length, sha256: sha256(plaintext) });
    }

    const manifestBody = encryptFile(Buffer.from(JSON.stringify(manifest)), "manifest.json");
    await putEncryptedObject(`${snapshotPrefix}/manifest.sipadi`, manifestBody, { kind: "manifest" });
    console.log(JSON.stringify({ status: "ok", bucket, snapshotPrefix, files: manifest.files.length }));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ status: "failed", code: error.code || "BACKUP_FAILED", message: error.message }));
  process.exitCode = 1;
});
