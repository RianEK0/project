import { query } from "../config/db.js";
import { asyncHandler, createHttpError } from "../utils/http.js";

export async function getArchiveById(id) {
  const result = await query("SELECT * FROM archives WHERE id = $1", [id]);
  const archive = result.rows[0];

  if (!archive) {
    throw createHttpError(404, "Arsip tidak ditemukan");
  }

  return archive;
}

export function requireArchivePermission(getAllowed, message) {
  return asyncHandler(async (req, res, next) => {
    const archive = await getArchiveById(req.params.id);

    const loanResult = await query(
      "SELECT id FROM archive_loans WHERE archive_id = $1 AND user_id = $2 AND status = 'Disetujui'",
      [archive.id, req.user.id]
    );
    const hasApprovedLoan = loanResult.rows.length > 0;

    if (!getAllowed(req.user, archive, hasApprovedLoan)) {
      throw createHttpError(403, message);
    }

    req.archive = archive;
    next();
  });
}
