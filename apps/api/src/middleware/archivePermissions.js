import { query } from "../config/db.js";
import { asyncHandler, createHttpError } from "../utils/http.js";
import { archivePolicyDecision } from "../services/permissions.js";

export async function getArchiveById(id) {
  const result = await query("SELECT * FROM archives WHERE id = $1", [id]);
  const archive = result.rows[0];

  if (!archive) {
    throw createHttpError(404, "Arsip tidak ditemukan");
  }

  return archive;
}

const grantTypesByAccess = {
  view: ["view", "download", "edit"],
  download: ["download"],
  edit: ["edit"]
};

function accessTypeFor(action = "archive:view") {
  if (action === "archive:download" || action === "archive:export") return "download";
  if (["archive:update", "archive:delete", "archive:verify", "archive:approve"].includes(action)) return "edit";
  return "view";
}

export function requireArchivePermission(getAllowed, message, options = {}) {
  return asyncHandler(async (req, res, next) => {
    const archive = await getArchiveById(req.params.id);
    const action = options.action || "archive:view";
    const accessType = options.accessType || accessTypeFor(action);

    const loanResult = await query(
      "SELECT id FROM archive_loans WHERE archive_id = $1 AND user_id = $2 AND status = 'Disetujui'",
      [archive.id, req.user.id]
    );
    const hasApprovedLoan = loanResult.rows.length > 0;
    const grantResult = await query(
      `SELECT id, access_type
       FROM archive_access_grants
       WHERE archive_id = $1
         AND user_id = $2
         AND revoked_at IS NULL
         AND valid_from <= NOW()
         AND valid_until > NOW()
         AND access_type = ANY($3::text[])`,
      [archive.id, req.user.id, grantTypesByAccess[accessType] || ["view"]]
    );
    const context = {
      approvedLoan: hasApprovedLoan,
      explicitAccessGrant: grantResult.rows,
      ip: req.ip,
      requestId: req.requestId,
      currentTime: new Date()
    };

    if (!getAllowed(req.user, archive, context)) {
      const decision = archivePolicyDecision(req.user, archive, action, context);
      throw createHttpError(403, decision.message || message, {
        code: decision.code || "ARCHIVE_ACCESS_DENIED",
        action: decision.action,
        reason: decision.reason,
        requiredClearance: decision.requiredClearance,
        userClearance: decision.userClearance,
        securityLevel: decision.securityLevel,
        riskScore: decision.riskScore
      });
    }

    req.archive = archive;
    next();
  });
}
