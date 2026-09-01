import { Router } from "express";
import { query } from "../config/db.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { asyncHandler, cleanText, pagination } from "../utils/http.js";
import { logActivity, verifyAuditChain } from "../services/audit.js";
import { enforceDataEgressPolicy } from "../services/dataEgressProtection.js";

const router = Router();

function buildAuditLogFilter(params = {}) {
  const where = [];
  const values = [];
  let index = 1;

  const search = cleanText(params.search);
  if (search) {
    values.push(`%${search}%`);
    where.push(`(al.action ILIKE $${index} OR al.entity ILIKE $${index} OR u.name ILIKE $${index})`);
    index += 1;
  }

  return {
    whereSql: where.length ? `WHERE ${where.join(" AND ")}` : "",
    values
  };
}

function escapeCsv(value) {
  const stringValue = value == null ? "" : String(value);
  if (!/[",\n]/.test(stringValue)) {
    return stringValue;
  }
  return `"${stringValue.replace(/"/g, '""')}"`;
}

router.get(
  "/",
  authenticate,
  authorize("Admin", "Inspektur"),
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = pagination(req.query);
    const { whereSql, values } = buildAuditLogFilter(req.query);
    const index = values.length + 1;

    const count = await query(
      `SELECT COUNT(*)::int AS total
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ${whereSql}`,
      values
    );

    const data = await query(
      `SELECT al.id, al.user_id, al.action, al.entity, al.entity_id, al.metadata,
              al.previous_hash, al.entry_hash, al.signing_key_id, al.created_at,
              u.name AS user_name, u.role AS user_role
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ${whereSql}
       ORDER BY al.created_at DESC
       LIMIT $${index} OFFSET $${index + 1}`,
      [...values, limit, offset]
    );

    res.json({
      data: data.rows,
      meta: { page, limit, total: count.rows[0].total }
    });
  })
);

router.get(
  "/integrity",
  authenticate,
  authorize("Admin", "Inspektur"),
  asyncHandler(async (req, res) => {
    const result = await verifyAuditChain();
    return res.json({ data: result });
  })
);

router.get(
  "/export",
  authenticate,
  authorize("Admin", "Inspektur"),
  asyncHandler(async (req, res) => {
    const format = cleanText(req.query.format || "csv")?.toLowerCase();
    const { whereSql, values } = buildAuditLogFilter(req.query);

    const result = await query(
      `SELECT al.id, al.user_id, al.action, al.entity, al.entity_id, al.metadata,
              al.previous_hash, al.entry_hash, al.signing_key_id, al.created_at,
              u.name AS user_name, u.role AS user_role
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ${whereSql}
       ORDER BY al.created_at DESC`,
      values
    );

    const egressWeight = Math.max(1, Math.ceil(result.rows.length / 100));
    const egress = await enforceDataEgressPolicy(req, { operation: "audit_log_export", weight: egressWeight });
    await logActivity({
      userId: req.user.id,
      action: "AUDIT_EXPORT",
      entity: "audit_log",
      metadata: { rows: result.rows.length, egressWeight, projectedEgressCount: egress.projected }
    });

    const stamp = new Date().toISOString().slice(0, 10);

    if (format === "json") {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="audit-log-${stamp}.json"`);
      return res.send(JSON.stringify({
        exportedAt: new Date().toISOString(),
        total: result.rows.length,
        data: result.rows
      }, null, 2));
    }

    const lines = [
      ["id", "created_at", "user_name", "user_role", "action", "entity", "entity_id", "signing_key_id", "previous_hash", "entry_hash", "metadata"].join(","),
      ...result.rows.map((row) => [
        row.id,
        row.created_at,
        row.user_name || "Sistem",
        row.user_role || "",
        row.action,
        row.entity,
        row.entity_id || "",
        row.signing_key_id || "",
        row.previous_hash || "",
        row.entry_hash || "",
        JSON.stringify(row.metadata || {})
      ].map(escapeCsv).join(","))
    ];

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="audit-log-${stamp}.csv"`);
    return res.send(lines.join("\n"));
  })
);

export default router;
