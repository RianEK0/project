import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { getClient, query } from "../config/db.js";
import { authenticate, authorize, requireRecentPasskeyFor } from "../middleware/auth.js";
import { getActiveBlocks } from "../middleware/security.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler, createHttpError, pagination } from "../utils/http.js";
import { appendAuditLog } from "../services/audit.js";
import { decideCriticalApproval, listCriticalApprovals } from "../services/criticalApprovals.js";
import { listDataEgressHolds } from "../services/dataEgressProtection.js";

const router = Router();
const SECURITY_ROLES = ["Admin", "Inspektur"];
const allowedSeverities = new Set(["low", "medium", "high", "critical"]);
const allowedStatuses = new Set(["open", "reviewed", "resolved"]);

const updateStatusSchema = z.object({
  status: z.enum(["open", "reviewed", "resolved"])
});

const approvalDecisionSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  reason: z.string().trim().min(10).max(500)
});

const releaseHoldSchema = z.object({
  reason: z.string().trim().min(10).max(500)
});

router.use(authenticate, authorize(...SECURITY_ROLES));

router.get(
  "/approvals",
  asyncHandler(async (req, res) => {
    const status = ["pending", "approved", "rejected", "executed", "expired", ""].includes(req.query.status)
      ? req.query.status
      : "pending";
    return res.json({ data: await listCriticalApprovals({ status }) });
  })
);

router.post(
  "/approvals/:id/decision",
  requireRecentPasskeyFor("approve-critical-operation"),
  validateBody(approvalDecisionSchema),
  asyncHandler(async (req, res) => {
    const approvalId = Number(req.params.id);
    if (!Number.isSafeInteger(approvalId) || approvalId <= 0) {
      return res.status(422).json({ message: "ID approval tidak valid" });
    }
    const result = await decideCriticalApproval({
      approvalId,
      approver: req.user,
      decision: req.body.decision,
      reason: req.body.reason,
      req
    });
    return res.json({ message: "Keputusan approval berhasil dicatat.", data: result });
  })
);

router.get(
  "/egress-holds",
  asyncHandler(async (req, res) => res.json({ data: await listDataEgressHolds() }))
);

router.post(
  "/egress-holds/:id/release",
  requireRecentPasskeyFor("release-data-egress-hold"),
  validateBody(releaseHoldSchema),
  asyncHandler(async (req, res) => {
    const holdId = Number(req.params.id);
    if (!Number.isSafeInteger(holdId) || holdId <= 0) {
      return res.status(422).json({ message: "ID hold tidak valid" });
    }
    const client = await getClient();
    try {
      await client.query("BEGIN");
      const current = await client.query("SELECT * FROM data_egress_holds WHERE id = $1 FOR UPDATE", [holdId]);
      const hold = current.rows[0];
      if (!hold || hold.released_at) throw createHttpError(404, "Hold aktif tidak ditemukan");
      if (Number(hold.user_id) === Number(req.user.id)) {
        throw createHttpError(403, "Petugas tidak boleh melepas hold miliknya sendiri");
      }
      const updated = await client.query(
        `UPDATE data_egress_holds
         SET released_at = NOW(), released_by = $1, release_reason = $2
         WHERE id = $3 RETURNING *`,
        [req.user.id, req.body.reason, holdId]
      );
      await appendAuditLog(client, {
        userId: req.user.id,
        action: "DATA_EGRESS_HOLD_RELEASED",
        entity: "data_egress_hold",
        entityId: holdId,
        metadata: { affectedUserId: hold.user_id, reason: req.body.reason }
      });
      await client.query("COMMIT");
      return res.json({ message: "Hold data berhasil dilepas.", data: updated.rows[0] });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  })
);

router.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const [totalsResult, severityResult, typeResult, recentResult, readinessResult] = await Promise.all([
      query(
        `SELECT
           COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int AS last_24_hours,
           COUNT(*) FILTER (WHERE status = 'open')::int AS open_events,
           COUNT(*) FILTER (WHERE status = 'open' AND severity IN ('high', 'critical'))::int AS urgent_open,
           (SELECT COUNT(*)::int FROM data_egress_holds
            WHERE released_at IS NULL AND blocked_until > NOW()) AS active_egress_holds
         FROM security_events`
      ),
      query(
        `SELECT severity, COUNT(*)::int AS total
         FROM security_events
         WHERE created_at >= NOW() - INTERVAL '24 hours'
         GROUP BY severity
         ORDER BY CASE severity
           WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END`
      ),
      query(
        `SELECT event_type, COUNT(*)::int AS total
         FROM security_events
         WHERE created_at >= NOW() - INTERVAL '24 hours'
         GROUP BY event_type
         ORDER BY total DESC, event_type ASC
         LIMIT 8`
      ),
      query(
        `SELECT se.id, se.event_type, se.severity, se.ip_address, se.request_id,
                se.method, se.path, se.status, se.metadata, se.created_at,
                u.name AS user_name
         FROM security_events se
         LEFT JOIN users u ON u.id = se.user_id
         ORDER BY se.created_at DESC
         LIMIT 8`
      ),
      query(
        `SELECT COUNT(*)::int AS active_officers,
                COUNT(*) FILTER (WHERE u.mfa_enabled)::int AS mfa_ready,
                COUNT(*) FILTER (WHERE EXISTS (
                  SELECT 1 FROM passkey_credentials pc WHERE pc.user_id = u.id
                ))::int AS passkey_ready
         FROM users u
         WHERE u.is_active = TRUE AND u.role IN ('Admin', 'Inspektur')`
      )
    ]);

    res.json({
      data: {
        totals: totalsResult.rows[0],
        bySeverity: severityResult.rows,
        byType: typeResult.rows,
        recentEvents: recentResult.rows,
        controlReadiness: readinessResult.rows[0],
        activeBlocks: await getActiveBlocks(),
        antivirus: {
          configured: Boolean(env.clamavHost),
          required: env.clamavRequired
        }
      }
    });
  })
);

router.get(
  "/events",
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = pagination(req.query);
    const values = [];
    const conditions = [];

    if (allowedSeverities.has(req.query.severity)) {
      values.push(req.query.severity);
      conditions.push(`se.severity = $${values.length}`);
    }
    if (allowedStatuses.has(req.query.status)) {
      values.push(req.query.status);
      conditions.push(`se.status = $${values.length}`);
    }
    if (req.query.type) {
      values.push(String(req.query.type).trim().slice(0, 80));
      conditions.push(`se.event_type = $${values.length}`);
    }
    if (req.query.search) {
      values.push(`%${String(req.query.search).trim().slice(0, 120)}%`);
      conditions.push(`(se.ip_address ILIKE $${values.length} OR se.path ILIKE $${values.length} OR se.request_id ILIKE $${values.length})`);
    }

    const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const countResult = await query(`SELECT COUNT(*)::int AS total FROM security_events se ${whereSql}`, values);

    values.push(limit, offset);
    const dataResult = await query(
      `SELECT se.id, se.event_type, se.severity, se.ip_address, se.request_id,
              se.method, se.path, se.status, se.metadata, se.created_at,
              u.name AS user_name
       FROM security_events se
       LEFT JOIN users u ON u.id = se.user_id
       ${whereSql}
       ORDER BY se.created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );

    res.json({
      data: dataResult.rows,
      meta: { page, limit, total: countResult.rows[0].total }
    });
  })
);

router.patch(
  "/events/:id/status",
  validateBody(updateStatusSchema),
  asyncHandler(async (req, res) => {
    const client = await getClient();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `UPDATE security_events
         SET status = $1, reviewed_by = $2,
             reviewed_at = CASE WHEN $1 = 'open' THEN NULL ELSE NOW() END
         WHERE id = $3 RETURNING *`,
        [req.body.status, req.user.id, req.params.id]
      );
      if (!result.rows[0]) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Insiden keamanan tidak ditemukan" });
      }
      await appendAuditLog(client, {
        userId: req.user.id,
        action: "SECURITY_EVENT_STATUS_CHANGED",
        entity: "security_event",
        entityId: Number(req.params.id),
        metadata: { status: req.body.status }
      });
      await client.query("COMMIT");
      return res.json({ data: result.rows[0] });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  })
);

export default router;
