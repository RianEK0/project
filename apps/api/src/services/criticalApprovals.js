import { createHash } from "node:crypto";
import { env } from "../config/env.js";
import { getClient, query } from "../config/db.js";
import { createHttpError } from "../utils/http.js";
import { appendAuditLog } from "./audit.js";
import { createNotification } from "./notificationService.js";
import { recordSecurityEvent } from "./securityEvents.js";

export const CRITICAL_APPROVAL_ACTIONS = Object.freeze([
  "BACKUP_EXPORT",
  "BACKUP_RESTORE",
  "RESET_MFA",
  "PRIVILEGED_USER_CREATE",
  "PRIVILEGED_USER_UPDATE",
  "PRIVILEGED_USER_PASSWORD_RESET",
  "PRIVILEGED_USER_DEACTIVATE"
]);

const actionSet = new Set(CRITICAL_APPROVAL_ACTIONS);

async function createNotificationSafely(input) {
  try {
    await createNotification(input);
  } catch (error) {
    console.error(`CRITICAL_APPROVAL_NOTIFICATION_FAILED ${String(error.code || error.message || "unknown").slice(0, 120)}`);
  }
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object" && !Buffer.isBuffer(value)) {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

export function approvalPayloadHash(value = {}) {
  const payload = Buffer.isBuffer(value) ? value : Buffer.from(JSON.stringify(canonicalize(value)));
  return createHash("sha256").update(payload).digest("hex");
}

function approvalError(approval) {
  return createHttpError(
    403,
    approval.status === "approved"
      ? "Approval operasi berubah. Silakan ulangi permintaan"
      : `Operasi kritis menunggu persetujuan pejabat kedua (tiket #${approval.id})`,
    {
      code: "DUAL_APPROVAL_REQUIRED",
      approvalId: approval.id,
      action: approval.action,
      status: approval.status,
      expiresAt: approval.expires_at
    }
  );
}

export async function requireCriticalApproval({
  action,
  resourceKey = "",
  payload = {},
  requester,
  reason,
  req
}) {
  if (!actionSet.has(action)) throw createHttpError(422, "Jenis approval operasi tidak valid");
  const payloadHash = approvalPayloadHash(payload);
  const normalizedResourceKey = String(resourceKey || "").slice(0, 160);
  const requestReason = String(reason || `Permintaan ${action}`).trim().slice(0, 500);
  if (requestReason.length < 10) throw createHttpError(422, "Alasan operasi kritis minimal 10 karakter");

  const client = await getClient();
  let approval;
  let created = false;
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE critical_operation_approvals
       SET status = 'expired', decided_at = COALESCE(decided_at, NOW())
       WHERE status IN ('pending', 'approved') AND expires_at <= NOW()`
    );
    const active = await client.query(
      `SELECT * FROM critical_operation_approvals
       WHERE action = $1 AND resource_key = $2 AND payload_hash = $3
         AND requested_by = $4 AND status IN ('pending', 'approved')
         AND expires_at > NOW()
       ORDER BY requested_at DESC LIMIT 1 FOR UPDATE`,
      [action, normalizedResourceKey, payloadHash, requester.id]
    );
    approval = active.rows[0];
    if (!approval) {
      const inserted = await client.query(
        `INSERT INTO critical_operation_approvals
           (action, resource_key, payload_hash, requested_by, request_reason, expires_at)
         VALUES ($1, $2, $3, $4, $5, NOW() + ($6 * INTERVAL '1 minute'))
         ON CONFLICT (action, resource_key, payload_hash, requested_by)
           WHERE status IN ('pending', 'approved')
         DO NOTHING
         RETURNING *`,
        [action, normalizedResourceKey, payloadHash, requester.id, requestReason, env.criticalApprovalTtlMinutes]
      );
      approval = inserted.rows[0];
      if (!approval) {
        const concurrent = await client.query(
          `SELECT * FROM critical_operation_approvals
           WHERE action = $1 AND resource_key = $2 AND payload_hash = $3
             AND requested_by = $4 AND status IN ('pending', 'approved') AND expires_at > NOW()
           ORDER BY requested_at DESC LIMIT 1 FOR UPDATE`,
          [action, normalizedResourceKey, payloadHash, requester.id]
        );
        approval = concurrent.rows[0];
      } else {
        created = true;
        await appendAuditLog(client, {
          userId: requester.id,
          action: "CRITICAL_APPROVAL_REQUESTED",
          entity: "critical_operation_approval",
          entityId: Number(approval.id),
          metadata: { operation: action, resourceKey: normalizedResourceKey, requestId: req?.requestId || null }
        });
      }
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  if (!approval) throw createHttpError(409, "Tiket approval berubah atau kedaluwarsa; ulangi permintaan");
  if (approval.status === "approved") return approval;

  if (created) {
    await recordSecurityEvent({
      type: "CRITICAL_APPROVAL_REQUESTED",
      severity: "high",
      req,
      userId: requester.id,
      metadata: { approvalId: approval.id, operation: action, resourceKey: normalizedResourceKey }
    });
    const approvers = await query(
      "SELECT id FROM users WHERE role IN ('Admin', 'Inspektur') AND is_active = TRUE AND id <> $1",
      [requester.id]
    );
    if (approvers.rows.length) {
      await createNotificationSafely({
        userIds: approvers.rows.map((row) => row.id),
        title: "Approval Operasi Kritis",
        message: `${requester.name || "Pengguna"} meminta persetujuan ${action}. Tiket #${approval.id}.`,
        type: "critical_approval",
        entityId: Number(approval.id)
      });
    }
  }
  throw approvalError(approval);
}

export async function consumeCriticalApproval(client, approval, { requesterId, requestId }) {
  const result = await client.query(
    `UPDATE critical_operation_approvals
     SET status = 'executed', executed_at = NOW(), executed_request_id = $1
     WHERE id = $2 AND requested_by = $3 AND status = 'approved'
       AND approved_by IS NOT NULL AND approved_by <> requested_by AND expires_at > NOW()
     RETURNING *`,
    [String(requestId || "").slice(0, 80) || null, approval.id, requesterId]
  );
  if (!result.rows[0]) throw createHttpError(409, "Approval sudah digunakan, ditolak, atau kedaluwarsa");
  return result.rows[0];
}

export async function listCriticalApprovals({ status = "pending", limit = 100 } = {}) {
  await query(
    `UPDATE critical_operation_approvals SET status = 'expired', decided_at = COALESCE(decided_at, NOW())
     WHERE status IN ('pending', 'approved') AND expires_at <= NOW()`
  );
  const values = [];
  const where = status ? "WHERE coa.status = $1" : "";
  if (status) values.push(status);
  values.push(Math.min(Math.max(Number(limit) || 50, 1), 100));
  const result = await query(
    `SELECT coa.*, requester.name AS requester_name, requester.role AS requester_role,
            approver.name AS approver_name
     FROM critical_operation_approvals coa
     JOIN users requester ON requester.id = coa.requested_by
     LEFT JOIN users approver ON approver.id = coa.approved_by
     ${where}
     ORDER BY coa.requested_at DESC LIMIT $${values.length}`,
    values
  );
  return result.rows;
}

export async function decideCriticalApproval({ approvalId, approver, decision, reason, req }) {
  if (!["approved", "rejected"].includes(decision)) throw createHttpError(422, "Keputusan approval tidak valid");
  const approvalReason = String(reason || "").trim().slice(0, 500);
  if (approvalReason.length < 10) throw createHttpError(422, "Catatan keputusan minimal 10 karakter");

  const client = await getClient();
  let updated;
  try {
    await client.query("BEGIN");
    const current = await client.query(
      `SELECT * FROM critical_operation_approvals WHERE id = $1 FOR UPDATE`,
      [approvalId]
    );
    const approval = current.rows[0];
    if (!approval || approval.status !== "pending" || new Date(approval.expires_at) <= new Date()) {
      throw createHttpError(409, "Tiket approval tidak aktif atau sudah kedaluwarsa");
    }
    if (Number(approval.requested_by) === Number(approver.id)) {
      throw createHttpError(403, "Pemohon tidak boleh menyetujui operasinya sendiri");
    }
    const result = await client.query(
      `UPDATE critical_operation_approvals
       SET status = $1, approved_by = $2, approval_reason = $3, decided_at = NOW()
       WHERE id = $4 RETURNING *`,
      [decision, approver.id, approvalReason, approvalId]
    );
    updated = result.rows[0];
    await appendAuditLog(client, {
      userId: approver.id,
      action: decision === "approved" ? "CRITICAL_APPROVAL_APPROVED" : "CRITICAL_APPROVAL_REJECTED",
      entity: "critical_operation_approval",
      entityId: Number(approvalId),
      metadata: { operation: approval.action, requesterId: approval.requested_by, requestId: req?.requestId || null }
    });
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  await createNotificationSafely({
    userIds: [updated.requested_by],
    title: decision === "approved" ? "Operasi Kritis Disetujui" : "Operasi Kritis Ditolak",
    message: `${updated.action} tiket #${updated.id} ${decision === "approved" ? "disetujui" : "ditolak"}.`,
    type: "critical_approval",
    entityId: Number(updated.id)
  });
  await recordSecurityEvent({
    type: decision === "approved" ? "CRITICAL_APPROVAL_APPROVED" : "CRITICAL_APPROVAL_REJECTED",
    severity: decision === "approved" ? "medium" : "high",
    req,
    userId: approver.id,
    metadata: { approvalId: updated.id, operation: updated.action, requesterId: updated.requested_by }
  });
  return updated;
}

export const criticalApprovalTestUtils = { canonicalize };
