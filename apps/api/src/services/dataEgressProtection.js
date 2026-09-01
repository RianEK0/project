import { env } from "../config/env.js";
import { getClient, query } from "../config/db.js";
import { createHttpError } from "../utils/http.js";
import { recordSecurityEvent } from "./securityEvents.js";

export function egressDecision(currentCount, weight, { alertThreshold, blockThreshold }) {
  const projected = Math.max(0, Number(currentCount) || 0) + Math.max(1, Number(weight) || 1);
  return {
    projected,
    alert: projected >= alertThreshold,
    block: projected >= blockThreshold
  };
}

function holdError(hold) {
  return createHttpError(429, "Akses download/ekspor ditahan sementara karena pola akses tidak biasa", {
    code: "DATA_EGRESS_HELD",
    holdId: hold.id,
    blockedUntil: hold.blocked_until
  });
}

export async function enforceDataEgressPolicy(req, {
  operation,
  weight = 1,
  entityId = null,
  classification = null
} = {}) {
  const normalizedOperation = String(operation || "data_egress").slice(0, 80);
  const normalizedWeight = Math.min(Math.max(Math.ceil(Number(weight) || 1), 1), 10000);
  const client = await getClient();
  let decision;
  let hold = null;
  let transactionClosed = false;
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1, $2)", [7421, Number(req.user.id)]);
    await client.query(
      `UPDATE data_egress_holds
       SET released_at = blocked_until, release_reason = 'automatic_expiry'
       WHERE user_id = $1 AND released_at IS NULL AND blocked_until <= NOW()`,
      [req.user.id]
    );
    const activeHold = await client.query(
      `SELECT * FROM data_egress_holds
       WHERE user_id = $1 AND released_at IS NULL AND blocked_until > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );
    if (activeHold.rows[0]) {
      await client.query("COMMIT");
      transactionClosed = true;
      throw holdError(activeHold.rows[0]);
    }

    const recent = await client.query(
      `SELECT COALESCE(SUM(weight), 0)::int AS event_count
       FROM data_egress_events
       WHERE user_id = $1
         AND created_at >= NOW() - ($2 * INTERVAL '1 minute')
         AND created_at > COALESCE(
           (SELECT MAX(released_at) FROM data_egress_holds
            WHERE user_id = $1 AND released_at IS NOT NULL),
           '-infinity'::timestamptz
         )`,
      [req.user.id, env.dataEgressWindowMinutes]
    );
    decision = egressDecision(recent.rows[0]?.event_count, normalizedWeight, {
      alertThreshold: env.dataEgressAlertThreshold,
      blockThreshold: env.dataEgressBlockThreshold
    });
    await client.query(
      `INSERT INTO data_egress_events
         (user_id, operation, weight, entity_id, classification, request_id, was_blocked)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [req.user.id, normalizedOperation, normalizedWeight, entityId,
        classification ? String(classification).slice(0, 80) : null,
        String(req.requestId || "").slice(0, 80) || null, decision.block]
    );

    if (decision.block) {
      const held = await client.query(
        `INSERT INTO data_egress_holds (user_id, reason, event_count, blocked_until)
         VALUES ($1, $2, $3, NOW() + ($4 * INTERVAL '1 minute'))
         ON CONFLICT (user_id) WHERE released_at IS NULL
         DO UPDATE SET reason = EXCLUDED.reason, event_count = EXCLUDED.event_count,
                       blocked_until = GREATEST(data_egress_holds.blocked_until, EXCLUDED.blocked_until)
         RETURNING *`,
        [req.user.id, normalizedOperation, decision.projected, env.dataEgressBlockMinutes]
      );
      hold = held.rows[0];
    }
    await client.query("COMMIT");
    transactionClosed = true;
  } catch (error) {
    if (!transactionClosed) await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  if (decision.alert) {
    await recordSecurityEvent({
      type: decision.block ? "DATA_EXFILTRATION_BLOCKED" : "DATA_EXFILTRATION_ANOMALY",
      severity: decision.block ? "critical" : "high",
      req,
      userId: req.user.id,
      metadata: {
        operation: normalizedOperation,
        projectedCount: decision.projected,
        windowMinutes: env.dataEgressWindowMinutes,
        entityId,
        classification
      }
    });
  }
  if (hold) throw holdError(hold);
  return decision;
}

export async function listDataEgressHolds() {
  await query(
    `UPDATE data_egress_holds
     SET released_at = blocked_until, release_reason = 'automatic_expiry'
     WHERE released_at IS NULL AND blocked_until <= NOW()`
  );
  const result = await query(
    `SELECT deh.*, u.name AS user_name, u.role AS user_role, releaser.name AS released_by_name
     FROM data_egress_holds deh
     JOIN users u ON u.id = deh.user_id
     LEFT JOIN users releaser ON releaser.id = deh.released_by
     ORDER BY deh.created_at DESC LIMIT 100`
  );
  return result.rows;
}
