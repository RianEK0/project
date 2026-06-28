import { cleanText, parseOptionalInt } from "../utils/http.js";

export const ARCHIVE_STATUSES = ["Draft", "Menunggu Review", "Terverifikasi", "Ditolak", "Diarsipkan"];
export const ARCHIVE_CATEGORIES = ["Arsip Aktif", "Arsip Inaktif", "Arsip Statis", "Arsip Musnah"];
export const DISPOSITION_STATUSES = ["Dikirim", "Dibaca", "Diproses", "Selesai", "Dibatalkan"];
export const FILE_TYPES = ["PDF", "DOC", "DOCX", "XLS", "XLSX", "JPG", "PNG"];

export function buildArchiveFilters({ filters, user, alias = "a", startIndex = 1 }) {
  const values = [];
  const where = [];
  let index = startIndex;

  const requestedUnitId = parseOptionalInt(filters.unitId || filters.unit_id);
  if (requestedUnitId) {
    values.push(requestedUnitId);
    where.push(`${alias}.unit_id = $${index}`);
    index += 1;
  }

  const search = cleanText(filters.search || filters.q);
  if (search) {
    values.push(`%${search}%`);
    where.push(`(${alias}.title ILIKE $${index} OR ${alias}.document_number ILIKE $${index} OR ${alias}.classification ILIKE $${index})`);
    index += 1;
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
      a.disposal_ba_number, a.disposal_doc_path
    FROM archives a
    JOIN organization_units ou ON ou.id = a.unit_id
    LEFT JOIN users creator ON creator.id = a.created_by
    LEFT JOIN users verifier ON verifier.id = a.verified_by
  `;
}
