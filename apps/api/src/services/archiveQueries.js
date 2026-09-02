import { cleanText, parseOptionalInt } from "../utils/http.js";
import { canAccessAllArchives } from "./permissions.js";

export const ARCHIVE_STATUSES = ["Draft", "Menunggu Review", "Terverifikasi", "Ditolak", "Diarsipkan"];
export const ARCHIVE_CATEGORIES = ["Arsip Aktif", "Arsip Inaktif", "Arsip Statis", "Arsip Musnah"];
export const DISPOSITION_STATUSES = ["Dikirim", "Dibaca", "Diproses", "Selesai", "Dibatalkan"];
export const FILE_TYPES = ["PDF", "DOC", "DOCX", "XLS", "XLSX", "JPG", "PNG", "TIFF"];
export const SECURITY_LEVELS = ["Biasa", "Terbatas", "Rahasia"];

function userSecurityClearance(user) {
  const parsed = Number(user?.securityClearance ?? user?.security_clearance ?? 1);
  return Number.isInteger(parsed) ? Math.min(Math.max(parsed, 1), 3) : 1;
}

function securityLevelRankSql(alias) {
  return `CASE ${alias}.security_level WHEN 'Rahasia' THEN 3 WHEN 'Terbatas' THEN 2 ELSE 1 END`;
}

export function buildArchiveFilters({ filters, user, alias = "a", startIndex = 1 }) {
  const values = [];
  const where = [];
  let index = startIndex;

  const trashFilter = cleanText(filters.trash || filters.deleted || filters.showDeleted);
  if (trashFilter === "1" || trashFilter === "true" || trashFilter === "only") {
    where.push(`${alias}.deleted_at IS NOT NULL`);
  } else if (trashFilter !== "all") {
    where.push(`${alias}.deleted_at IS NULL`);
  }

  if (user) {
    const userUnitIndex = index + 1;
    const userIdIndex = index + 2;
    values.push(userSecurityClearance(user), user.unitId ?? user.unit_id ?? null, user.id ?? null);
    where.push(`${securityLevelRankSql(alias)} <= $${index}`);
    const scope = [
      `${alias}.unit_id = $${userUnitIndex}`,
      `${alias}.created_by = $${userIdIndex}`,
      `EXISTS (
        SELECT 1 FROM archive_loans scope_loan
        WHERE scope_loan.archive_id = ${alias}.id
          AND scope_loan.user_id = $${userIdIndex}
          AND scope_loan.status = 'Disetujui'
      )`,
      `EXISTS (
        SELECT 1 FROM archive_access_grants scope_grant
        WHERE scope_grant.archive_id = ${alias}.id
          AND scope_grant.user_id = $${userIdIndex}
          AND scope_grant.revoked_at IS NULL
          AND scope_grant.valid_from <= NOW()
          AND scope_grant.valid_until > NOW()
          AND scope_grant.access_type IN ('view', 'download', 'edit')
      )`
    ];
    if (canAccessAllArchives(user)) {
      scope.push(`${securityLevelRankSql(alias)} = 1`);
    }
    where.push(
      `(${scope.join(" OR ")})`
    );
    index += 3;
  }

  const requestedUnitId = parseOptionalInt(filters.unitId || filters.unit_id);
  if (requestedUnitId) {
    values.push(requestedUnitId);
    where.push(`${alias}.unit_id = $${index}`);
    index += 1;
  }

  const search = cleanText(filters.search || filters.q);
  if (search) {
    const searchId = parseOptionalInt(search);
    if (searchId) {
      values.push(`%${search}%`, searchId);
      where.push(
        `(${alias}.title ILIKE $${index} OR ${alias}.document_number ILIKE $${index} OR ${alias}.classification ILIKE $${index} OR ${alias}.id = $${index + 1})`
      );
      index += 2;
    } else {
      values.push(`%${search}%`);
      where.push(`(${alias}.title ILIKE $${index} OR ${alias}.document_number ILIKE $${index} OR ${alias}.classification ILIKE $${index})`);
      index += 1;
    }
  }

  const status = cleanText(filters.status);
  if (status) {
    values.push(status);
    where.push(`${alias}.status = $${index}`);
    index += 1;
  }

  const documentType = cleanText(filters.documentType || filters.document_type);
  if (documentType) {
    values.push(documentType);
    where.push(`${alias}.document_type = $${index}`);
    index += 1;
  }

  const classification = cleanText(filters.classification);
  if (classification) {
    values.push(classification);
    where.push(`${alias}.classification = $${index}`);
    index += 1;
  }

  const archiveCategory = cleanText(filters.archiveCategory || filters.archive_category);
  if (archiveCategory) {
    values.push(archiveCategory);
    where.push(`${alias}.archive_category = $${index}`);
    index += 1;
  }

  const fileType = cleanText(filters.fileType || filters.file_type);
  if (fileType) {
    values.push(fileType.toUpperCase());
    where.push(`${alias}.file_type = $${index}`);
    index += 1;
  }

  const year = parseOptionalInt(filters.year);
  if (year) {
    values.push(year);
    where.push(`${alias}.year = $${index}`);
    index += 1;
  }

  const retentionStatus = cleanText(filters.retentionStatus || filters.retention_status);
  if (retentionStatus === "active_expired") {
    where.push(`${alias}.lifecycle_status = 'Aktif' AND ${alias}.status = 'Diarsipkan' AND CURRENT_DATE >= (${alias}.archive_date + (${alias}.active_retention * INTERVAL '1 year'))`);
  } else if (retentionStatus === "inactive_expired") {
    where.push(`${alias}.lifecycle_status = 'Inaktif' AND ${alias}.status = 'Diarsipkan' AND CURRENT_DATE >= (${alias}.archive_date + ((${alias}.active_retention + ${alias}.inactive_retention) * INTERVAL '1 year'))`);
  }

  return {
    whereSql: where.length ? `WHERE ${where.join(" AND ")}` : "",
    values,
    nextIndex: index
  };
}

export function archiveSelectSql() {
  return `
    SELECT
      a.id, a.title, a.document_number, a.unit_id, ou.name AS unit_name,
      a.document_type, a.file_type, a.year, a.status, a.classification, a.archive_category, a.description,
      a.file_original_name, a.file_size, a.created_by, creator.name AS creator_name,
      a.verified_by, verifier.name AS verifier_name, a.verified_at, a.created_at, a.updated_at,
      a.letter_number, a.archive_date, a.security_level, a.active_retention, a.inactive_retention, a.lifecycle_status,
      a.destruction_ba_number, a.destruction_date, a.destruction_method, a.destruction_officer, a.destruction_doc_path, a.destruction_photo_path,
      a.disposal_ba_number, a.disposal_doc_path,
      a.pending_disposal_target, a.pending_disposal_ba_number, a.pending_disposal_doc_path,
      a.disposal_reviewed_by, review_disposer.name AS disposal_reviewed_by_name, a.disposal_reviewed_at,
      a.disposal_approved_by, approve_disposer.name AS disposal_approved_by_name, a.disposal_approved_at,
      a.location_room, a.location_rack, a.location_box, a.location_folder, a.location_file_number,
      a.deleted_at, a.deleted_by
    FROM archives a
    JOIN organization_units ou ON ou.id = a.unit_id
    LEFT JOIN users creator ON creator.id = a.created_by
    LEFT JOIN users verifier ON verifier.id = a.verified_by
    LEFT JOIN users review_disposer ON review_disposer.id = a.disposal_reviewed_by
    LEFT JOIN users approve_disposer ON approve_disposer.id = a.disposal_approved_by
  `;
}
