import { Router } from "express";
import { z } from "zod";
import { getClient, query } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";
import { requireArchivePermission } from "../middleware/archivePermissions.js";
import { archiveUpload, encryptUploadedFiles, scanUploadedFiles, spreadsheetUpload, uploadedFileToDb, validateArchiveFiles } from "../middleware/upload.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler, cleanText, createHttpError, pagination, parseOptionalInt } from "../utils/http.js";
import { logActivity } from "../services/audit.js";
import { createNotification } from "../services/notificationService.js";
import { buildArchiveImportPreview } from "../services/archiveImport.js";
import { enforceDataEgressPolicy } from "../services/dataEgressProtection.js";
import { sendStoredObject, storedObjectExists } from "../services/fileStorage.js";
import { ARCHIVE_CATEGORIES, ARCHIVE_STATUSES, FILE_TYPES, archiveSelectSql, buildArchiveFilters } from "../services/archiveQueries.js";
import {
  canChooseArchiveUnit,
  canDeleteArchive,
  canDownloadArchive,
  canEditArchive,
  canUpdateArchiveStatus,
  canViewArchive
} from "../services/permissions.js";

const router = Router();

const commentSchema = z.object({
  comment: z.string().trim().min(3)
});

const verifySchema = z.object({
  status: z.enum(["Menunggu Review", "Terverifikasi", "Ditolak", "Diarsipkan"]),
  note: z.string().trim().optional().default("")
});

const STOCK_OPNAME_STATUSES = ["Sesuai", "Tidak Sesuai Lokasi", "Tidak Ditemukan", "Rusak"];

function ensureValidChoice(value, choices, fieldName) {
  if (!choices.includes(value)) {
    throw createHttpError(422, `${fieldName} tidak valid`);
  }
}

function archiveInput(req, existing = {}) {
  const uploaded = uploadedFileToDb(req.file);
  const title = cleanText(req.body.title) ?? existing.title;
  const documentNumber = cleanText(req.body.documentNumber || req.body.document_number) ?? existing.document_number;
  const documentType = cleanText(req.body.documentType || req.body.document_type) ?? existing.document_type;
  const status = cleanText(req.body.status) ?? existing.status ?? "Draft";
  const classification = cleanText(req.body.classification) ?? existing.classification ?? "Internal";
  const archiveCategory = cleanText(req.body.archiveCategory || req.body.archive_category) ?? existing.archive_category ?? "Arsip Aktif";
  const description = cleanText(req.body.description) ?? existing.description ?? "";
  const year = parseOptionalInt(req.body.year) ?? existing.year ?? new Date().getFullYear();
  const requestedUnitId = parseOptionalInt(req.body.unitId || req.body.unit_id);
  const unitId = canChooseArchiveUnit(req.user) ? requestedUnitId ?? existing.unit_id : req.user.unitId;
  const fileType = (uploaded.fileType || cleanText(req.body.fileType || req.body.file_type) || existing.file_type || "PDF").toUpperCase();

  const letterNumber = cleanText(req.body.letterNumber || req.body.letter_number) ?? existing.letter_number;
  const archiveDate = cleanText(req.body.archiveDate || req.body.archive_date) ?? existing.archive_date;
  const securityLevel = cleanText(req.body.securityLevel || req.body.security_level) ?? existing.security_level ?? "Biasa";
  const activeRetention = parseOptionalInt(req.body.activeRetention || req.body.active_retention) ?? existing.active_retention ?? 0;
  const inactiveRetention = parseOptionalInt(req.body.inactiveRetention || req.body.inactive_retention) ?? existing.inactive_retention ?? 0;
  const lifecycleStatus = cleanText(req.body.lifecycleStatus || req.body.lifecycle_status) ?? existing.lifecycle_status ?? "Aktif";
  const locationRoom = cleanText(req.body.locationRoom || req.body.location_room) ?? existing.location_room ?? "";
  const locationRack = cleanText(req.body.locationRack || req.body.location_rack) ?? existing.location_rack ?? "";
  const locationBox = cleanText(req.body.locationBox || req.body.location_box) ?? existing.location_box ?? "";
  const locationFolder = cleanText(req.body.locationFolder || req.body.location_folder) ?? existing.location_folder ?? "";
  const locationFileNumber = cleanText(req.body.locationFileNumber || req.body.location_file_number) ?? existing.location_file_number ?? "";

  if (!title || !documentNumber || !documentType || !unitId) {
    throw createHttpError(422, "Judul, nomor dokumen, jenis dokumen, dan unit wajib diisi");
  }

  ensureValidChoice(status, ARCHIVE_STATUSES, "Status dokumen");
  ensureValidChoice(archiveCategory, ARCHIVE_CATEGORIES, "Kategori arsip");
  ensureValidChoice(fileType, FILE_TYPES, "Tipe file");

  // Hapus "Sangat Rahasia" — normalkan ke "Rahasia" jika ada data lama
  const normalizedSecurityLevel = securityLevel === "Sangat Rahasia" ? "Rahasia" : securityLevel;
  if (!["Biasa", "Terbatas", "Rahasia"].includes(normalizedSecurityLevel)) {
    throw createHttpError(422, "Tingkat keamanan tidak valid. Pilih: Biasa, Terbatas, atau Rahasia.");
  }

  // "Rahasia" hanya diizinkan untuk file TIFF atau PDF
  if (normalizedSecurityLevel === "Rahasia" && fileType !== "TIFF" && fileType !== "PDF") {
    throw createHttpError(422, "Tingkat keamanan 'Rahasia' hanya diperbolehkan untuk file bertipe TIFF atau PDF.");
  }

  // Jika tipe file adalah TIFF, tingkat keamanan WAJIB "Rahasia"
  if (fileType === "TIFF" && normalizedSecurityLevel !== "Rahasia") {
    throw createHttpError(422, "Arsip dengan tipe file TIFF wajib menggunakan tingkat keamanan 'Rahasia'.");
  }

  return {
    title,
    documentNumber,
    documentType,
    status,
    classification,
    archiveCategory,
    description,
    year,
    unitId,
    fileType,
    letterNumber,
    archiveDate,
    securityLevel: normalizedSecurityLevel,
    activeRetention,
    inactiveRetention,
    lifecycleStatus,
    locationRoom,
    locationRack,
    locationBox,
    locationFolder,
    locationFileNumber,
    ...uploaded
  };
}

function ensureArchiveActive(archive) {
  if (archive?.deleted_at) {
    throw createHttpError(409, "Arsip ini sedang berada di sampah dan harus direstore terlebih dahulu");
  }
}

function parseBooleanValue(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function getLocationFields(source = {}, fallback = {}) {
  return {
    room: cleanText(source.locationRoom || source.location_room) ?? fallback.room ?? "",
    rack: cleanText(source.locationRack || source.location_rack) ?? fallback.rack ?? "",
    box: cleanText(source.locationBox || source.location_box) ?? fallback.box ?? "",
    folder: cleanText(source.locationFolder || source.location_folder) ?? fallback.folder ?? "",
    fileNumber: cleanText(source.locationFileNumber || source.location_file_number) ?? fallback.fileNumber ?? ""
  };
}

async function findExistingDocumentNumbers(documentNumbers) {
  if (!documentNumbers.length) {
    return [];
  }

  const result = await query(
    "SELECT document_number FROM archives WHERE document_number = ANY($1)",
    [documentNumbers]
  );

  return result.rows.map((row) => row.document_number);
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseCsvContent(content) {
  return content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseCsvLine);
}

function resolveImportedArchiveInput(row, user) {
  const title = cleanText(row.title);
  const documentNumber = cleanText(row.document_number || row.documentNumber);
  const documentType = cleanText(row.document_type || row.documentType);
  const status = cleanText(row.status) || "Draft";
  const classification = cleanText(row.classification) || "Internal";
  const archiveCategory = cleanText(row.archive_category || row.archiveCategory) || "Arsip Aktif";
  const description = cleanText(row.description) || "";
  const year = parseOptionalInt(row.year) ?? new Date().getFullYear();
  const requestedUnitId = parseOptionalInt(row.unit_id || row.unitId);
  const unitId = canChooseArchiveUnit(user) ? requestedUnitId ?? user.unitId : user.unitId;
  const fileType = (cleanText(row.file_type || row.fileType) || "PDF").toUpperCase();
  const letterNumber = cleanText(row.letter_number || row.letterNumber) || null;
  const archiveDate = cleanText(row.archive_date || row.archiveDate) || new Date().toISOString().split("T")[0];
  const securityLevel = cleanText(row.security_level || row.securityLevel) || "Biasa";
  const activeRetention = parseOptionalInt(row.active_retention || row.activeRetention) ?? 0;
  const inactiveRetention = parseOptionalInt(row.inactive_retention || row.inactiveRetention) ?? 0;
  const lifecycleStatus = cleanText(row.lifecycle_status || row.lifecycleStatus) || "Aktif";
  const locationRoom = cleanText(row.location_room || row.locationRoom) || null;
  const locationRack = cleanText(row.location_rack || row.locationRack) || null;
  const locationBox = cleanText(row.location_box || row.locationBox) || null;
  const locationFolder = cleanText(row.location_folder || row.locationFolder) || null;
  const locationFileNumber = cleanText(row.location_file_number || row.locationFileNumber) || null;

  if (!title || !documentNumber || !documentType || !unitId) {
    throw createHttpError(422, "Kolom title, document_number, document_type, dan unit_id wajib diisi pada file CSV");
  }

  ensureValidChoice(status, ARCHIVE_STATUSES, "Status dokumen");
  ensureValidChoice(archiveCategory, ARCHIVE_CATEGORIES, "Kategori arsip");
  ensureValidChoice(fileType, FILE_TYPES, "Tipe file");

  const normalizedSecurityLevel = securityLevel === "Sangat Rahasia" ? "Rahasia" : securityLevel;
  if (!["Biasa", "Terbatas", "Rahasia"].includes(normalizedSecurityLevel)) {
    throw createHttpError(422, "Tingkat keamanan tidak valid. Pilih: Biasa, Terbatas, atau Rahasia.");
  }
  if (normalizedSecurityLevel === "Rahasia" && fileType !== "TIFF" && fileType !== "PDF") {
    throw createHttpError(422, "Tingkat keamanan 'Rahasia' hanya diperbolehkan untuk file bertipe TIFF atau PDF.");
  }
  if (fileType === "TIFF" && normalizedSecurityLevel !== "Rahasia") {
    throw createHttpError(422, "Arsip dengan tipe file TIFF wajib menggunakan tingkat keamanan 'Rahasia'.");
  }

  return {
    title,
    documentNumber,
    documentType,
    status,
    classification,
    archiveCategory,
    description,
    year,
    unitId,
    fileType,
    letterNumber,
    archiveDate,
    securityLevel: normalizedSecurityLevel,
    activeRetention,
    inactiveRetention,
    lifecycleStatus,
    locationRoom,
    locationRack,
    locationBox,
    locationFolder,
    locationFileNumber
  };
}

const archiveLoanDetailSelectSql = `
  SELECT l.*, approver.name AS approved_by_name, returner.name AS returned_by_name,
         hist.loan_history_id,
         COALESCE(ext_count.extension_count, 0) AS extension_count,
         ext.extension_id,
         ext.extension_status,
         ext.extension_reason,
         ext.extension_current_deadline,
         ext.extension_requested_deadline,
         ext.extension_review_notes,
         ext.extension_requested_at,
         ext.extension_reviewed_at,
         ext.extension_reviewed_by_name
  FROM archive_loans l
  LEFT JOIN users approver ON approver.id = l.approved_by
  LEFT JOIN users returner ON returner.id = l.returned_by
  LEFT JOIN LATERAL (
    SELECT h.id AS loan_history_id
    FROM archive_loan_histories h
    WHERE h.loan_id = l.id
    ORDER BY h.created_at DESC, h.id DESC
    LIMIT 1
  ) hist ON TRUE
  LEFT JOIN LATERAL (
    SELECT e.id AS extension_id,
           e.status AS extension_status,
           e.reason AS extension_reason,
           e.current_deadline AS extension_current_deadline,
           e.requested_deadline AS extension_requested_deadline,
           e.review_notes AS extension_review_notes,
           e.created_at AS extension_requested_at,
           e.reviewed_at AS extension_reviewed_at,
           reviewer.name AS extension_reviewed_by_name
    FROM archive_loan_extensions e
    LEFT JOIN users reviewer ON reviewer.id = e.reviewed_by
    WHERE e.loan_history_id = hist.loan_history_id
    ORDER BY e.created_at DESC, e.id DESC
    LIMIT 1
  ) ext ON TRUE
  LEFT JOIN LATERAL (
    SELECT COUNT(*)::int AS extension_count
    FROM archive_loan_extensions e
    WHERE e.loan_history_id = hist.loan_history_id
  ) ext_count ON TRUE
`;

router.get(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = pagination(req.query);
    const filters = buildArchiveFilters({ filters: req.query, user: req.user });

    const countResult = await query(
      `SELECT COUNT(*)::int AS total FROM archives a ${filters.whereSql}`,
      filters.values
    );

    const dataResult = await query(
      `SELECT 
        a.id, a.title, a.document_number, a.unit_id, ou.name AS unit_name,
        a.document_type, a.file_type, a.year, a.status, a.classification, a.archive_category, a.description,
        a.file_original_name, a.file_size, a.created_by, creator.name AS creator_name,
        a.verified_by, verifier.name AS verifier_name, a.verified_at, a.created_at, a.updated_at,
        a.letter_number, a.archive_date, a.security_level, a.active_retention, a.inactive_retention, a.lifecycle_status,
        a.destruction_ba_number, a.destruction_date, a.destruction_method, a.destruction_officer, a.destruction_doc_path, a.destruction_photo_path,
        a.disposal_ba_number, a.disposal_doc_path,
        a.location_room, a.location_rack, a.location_box, a.location_folder, a.location_file_number,
        a.deleted_at, a.deleted_by,
        l.status AS loan_status, l.id AS loan_id, l.loan_date, l.loan_deadline
       FROM archives a
       JOIN organization_units ou ON ou.id = a.unit_id
       LEFT JOIN users creator ON creator.id = a.created_by
       LEFT JOIN users verifier ON verifier.id = a.verified_by
       LEFT JOIN archive_loans l ON l.archive_id = a.id AND l.user_id = $${filters.nextIndex}
       ${filters.whereSql}
       ORDER BY a.created_at DESC
       LIMIT $${filters.nextIndex + 1} OFFSET $${filters.nextIndex + 2}`,
      [...filters.values, req.user.id, limit, offset]
    );

    res.json({
      data: dataResult.rows,
      meta: {
        page,
        limit,
        total: countResult.rows[0].total
      }
    });
  })
);

router.post(
  "/",
  authenticate,
  archiveUpload.single("file"),
  validateArchiveFiles,
  scanUploadedFiles,
  encryptUploadedFiles,
  asyncHandler(async (req, res) => {
    const input = archiveInput(req);

    try {
      const result = await query(
        `INSERT INTO archives (
          title, document_number, unit_id, document_type, file_type, year, status, classification, archive_category,
          description, file_path, file_original_name, file_size, created_by,
          letter_number, archive_date, security_level, active_retention, inactive_retention, lifecycle_status,
          location_room, location_rack, location_box, location_folder, location_file_number
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
        RETURNING *`,
        [
          input.title,
          input.documentNumber,
          input.unitId,
          input.documentType,
          input.fileType,
          input.year,
          input.status,
          input.classification,
          input.archiveCategory,
          input.description,
          input.filePath || null,
          input.fileOriginalName || null,
          input.fileSize || null,
          req.user.id,
          input.letterNumber || null,
          input.archiveDate || new Date().toISOString().split("T")[0],
          input.securityLevel || "Biasa",
          input.activeRetention || 0,
          input.inactiveRetention || 0,
          input.lifecycleStatus || "Aktif",
          input.locationRoom || null,
          input.locationRack || null,
          input.locationBox || null,
          input.locationFolder || null,
          input.locationFileNumber || null
        ]
      );

      await logActivity({
        userId: req.user.id,
        action: "CREATE",
        entity: "archive",
        entityId: result.rows[0].id,
        metadata: { title: input.title, documentNumber: input.documentNumber }
      });

      // Broadcast notifikasi ke semua user
      await createNotification({
        broadcast: true,
        title: "Arsip Baru Dibuat",
        message: `${req.user.name} membuat arsip baru: "${input.title}" (${input.documentNumber}).`,
        type: "archive_created",
        entityId: result.rows[0].id
      });

      res.status(201).json({ data: result.rows[0] });
    } catch (error) {
      if (error.code === "23505") {
        throw createHttpError(409, "Nomor dokumen sudah digunakan");
      }
      throw error;
    }
  })
);

router.post(
  "/import-preview",
  authenticate,
  spreadsheetUpload.single("file"),
  scanUploadedFiles,
  asyncHandler(async (req, res) => {
    const preview = await buildArchiveImportPreview({
      file: req.file,
      user: req.user,
      findExistingDocumentNumbers
    });

    res.json({
      message: preview.summary.invalidRows
        ? "Preview import selesai. Perbaiki baris yang masih bermasalah sebelum impor."
        : "Preview import siap. Semua baris valid untuk diimpor.",
      data: preview
    });
  })
);

router.post(
  ["/import-spreadsheet", "/import-csv"],
  authenticate,
  spreadsheetUpload.single("file"),
  scanUploadedFiles,
  asyncHandler(async (req, res) => {
    const preview = await buildArchiveImportPreview({
      file: req.file,
      user: req.user,
      findExistingDocumentNumbers
    });

    if (preview.summary.invalidRows > 0) {
      const error = createHttpError(422, "File impor masih memiliki baris yang tidak valid");
      error.details = {
        summary: preview.summary,
        preview: preview.preview.slice(0, 50)
      };
      throw error;
    }

    const client = await getClient();

    try {
      await client.query("BEGIN");

      const createdArchives = [];

      for (const item of preview.validRows) {
        const input = item.normalized;

        const result = await client.query(
          `INSERT INTO archives (
            title, document_number, unit_id, document_type, file_type, year, status, classification, archive_category,
            description, created_by, letter_number, archive_date, security_level, active_retention, inactive_retention,
            lifecycle_status, location_room, location_rack, location_box, location_folder, location_file_number
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
          RETURNING id, title, document_number`,
          [
            input.title,
            input.documentNumber,
            input.unitId,
            input.documentType,
            input.fileType,
            input.year,
            input.status,
            input.classification,
            input.archiveCategory,
            input.description,
            req.user.id,
            input.letterNumber,
            input.archiveDate,
            input.securityLevel,
            input.activeRetention,
            input.inactiveRetention,
            input.lifecycleStatus,
            input.locationRoom,
            input.locationRack,
            input.locationBox,
            input.locationFolder,
            input.locationFileNumber
          ]
        );

        createdArchives.push(result.rows[0]);
      }

      await client.query("COMMIT");

      await logActivity({
        userId: req.user.id,
        action: "IMPORT_SPREADSHEET",
        entity: "archive",
        metadata: {
          totalImported: createdArchives.length,
          filename: req.file.originalname
        }
      });

      res.status(201).json({
        message: `${createdArchives.length} arsip berhasil diimpor dari file ${req.file.originalname}.`,
        data: {
          createdArchives,
          summary: preview.summary
        }
      });
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23505") {
        throw createHttpError(409, "Ada nomor dokumen duplikat pada file impor atau data yang sudah ada");
      }
      throw error;
    } finally {
      client.release();
    }
  })
);

router.get(
  "/:id",
  authenticate,
  requireArchivePermission(canViewArchive, "Anda tidak dapat melihat arsip ini"),
  asyncHandler(async (req, res) => {
    const archive = req.archive;
    const archiveResult = await query(
      `${archiveSelectSql()}
       LEFT JOIN users deleter ON deleter.id = a.deleted_by
       WHERE a.id = $1`,
      [req.params.id]
    );

    const commentsResult = await query(
      `SELECT c.id, c.comment, c.created_at, u.name AS user_name, u.role AS user_role
       FROM archive_comments c
       LEFT JOIN users u ON u.id = c.user_id
       WHERE c.archive_id = $1
       ORDER BY c.created_at ASC`,
      [req.params.id]
    );

    const dispositionsResult = await query(
      `SELECT d.id, d.note, d.deadline, d.status, d.created_at, d.updated_at,
              fu.name AS from_user_name, tu.name AS to_user_name, ou.name AS to_unit_name
       FROM dispositions d
       LEFT JOIN users fu ON fu.id = d.from_user_id
       LEFT JOIN users tu ON tu.id = d.to_user_id
       LEFT JOIN organization_units ou ON ou.id = d.to_unit_id
       WHERE d.archive_id = $1
       ORDER BY d.created_at DESC`,
      [req.params.id]
    );

    const logsResult = await query(
      `SELECT l.*, u.name AS officer_name, u.role AS officer_role
       FROM archive_lifecycle_logs l
       LEFT JOIN users u ON l.officer_id = u.id
       WHERE l.archive_id = $1
       ORDER BY l.created_at ASC`,
      [req.params.id]
    );

    const locationLogsResult = await query(
      `SELECT ll.*, mover.name AS moved_by_name, mover.role AS moved_by_role
       FROM archive_location_logs ll
       LEFT JOIN users mover ON mover.id = ll.moved_by
       WHERE ll.archive_id = $1
       ORDER BY ll.created_at DESC, ll.id DESC
       LIMIT 20`,
      [req.params.id]
    );

    const stockOpnamesResult = await query(
      `SELECT so.*, checker.name AS checked_by_name, checker.role AS checked_by_role
       FROM archive_stock_opnames so
       LEFT JOIN users checker ON checker.id = so.checked_by
       WHERE so.archive_id = $1
       ORDER BY so.created_at DESC, so.id DESC
       LIMIT 20`,
      [req.params.id]
    );

    // Fetch loan info for current user
    const loanResult = await query(
      `${archiveLoanDetailSelectSql}
       WHERE l.archive_id = $1 AND l.user_id = $2`,
      [req.params.id, req.user.id]
    );

    const loanHistoryResult = await query(
      `SELECT h.*, borrower.name AS requester_name, borrower.role AS requester_role,
              approver.name AS approved_by_name, returner.name AS returned_by_name,
              COALESCE(ext_count.extension_count, 0) AS extension_count,
              latest_ext.extension_status,
              latest_ext.extension_requested_deadline,
              latest_ext.extension_reviewed_at
       FROM archive_loan_histories h
       JOIN users borrower ON borrower.id = h.user_id
       LEFT JOIN users approver ON approver.id = h.approved_by
       LEFT JOIN users returner ON returner.id = h.returned_by
       LEFT JOIN LATERAL (
         SELECT COUNT(*)::int AS extension_count
         FROM archive_loan_extensions e
         WHERE e.loan_history_id = h.id
       ) ext_count ON TRUE
       LEFT JOIN LATERAL (
         SELECT e.status AS extension_status,
                e.requested_deadline AS extension_requested_deadline,
                e.reviewed_at AS extension_reviewed_at
         FROM archive_loan_extensions e
         WHERE e.loan_history_id = h.id
         ORDER BY e.created_at DESC, e.id DESC
         LIMIT 1
       ) latest_ext ON TRUE
       WHERE h.archive_id = $1
       ORDER BY h.created_at DESC, h.id DESC`,
      [req.params.id]
    );

    const accessLogsResult = await query(
      `SELECT al.id, al.action, al.entity, al.entity_id, al.metadata, al.created_at,
              u.name AS user_name, u.role AS user_role
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       WHERE (al.entity = 'archive' AND al.entity_id = $1 AND al.action IN ('VIEW', 'PREVIEW', 'DOWNLOAD', 'CREATE', 'UPDATE', 'DELETE', 'RESTORE'))
          OR (al.entity = 'archive_loan' AND COALESCE(al.metadata->>'archiveId', '') = $2)
          OR (al.entity = 'archive_loan_extension' AND COALESCE(al.metadata->>'archiveId', '') = $2)
       ORDER BY al.created_at DESC
       LIMIT 20`,
      [req.params.id, String(req.params.id)]
    );

    await logActivity({
      userId: req.user.id,
      action: "VIEW",
      entity: "archive",
      entityId: archive.id,
      metadata: { documentNumber: archive.document_number, deleted: Boolean(archive.deleted_at) }
    });

    res.json({
      data: {
        ...archiveResult.rows[0],
        comments: commentsResult.rows,
        dispositions: dispositionsResult.rows,
        lifecycleLogs: logsResult.rows,
        locationLogs: locationLogsResult.rows,
        stockOpnames: stockOpnamesResult.rows,
        loan: loanResult.rows[0] || null,
        loanHistory: loanHistoryResult.rows,
        accessLogs: accessLogsResult.rows
      }
    });
  })
);

router.put(
  "/:id",
  authenticate,
  requireArchivePermission(canEditArchive, "Hanya Admin atau divisi pemilik arsip yang dapat mengubah data ini"),
  archiveUpload.single("file"),
  validateArchiveFiles,
  scanUploadedFiles,
  encryptUploadedFiles,
  asyncHandler(async (req, res) => {
    const existing = req.archive;
    ensureArchiveActive(existing);

    const input = archiveInput(req, existing);

    if (input.status !== existing.status && !canUpdateArchiveStatus(req.user, existing)) {
      throw createHttpError(403, "Anda tidak dapat mengubah status arsip ini");
    }

    try {
      const result = await query(
        `UPDATE archives
         SET title = $1, document_number = $2, unit_id = $3, document_type = $4, file_type = $5,
             year = $6, status = $7, classification = $8, archive_category = $9, description = $10,
             file_path = COALESCE($11, file_path),
             file_original_name = COALESCE($12, file_original_name),
             file_size = COALESCE($13, file_size),
             letter_number = $14,
             archive_date = $15,
             security_level = $16,
             active_retention = $17,
             inactive_retention = $18,
             lifecycle_status = $19,
             location_room = $20,
             location_rack = $21,
             location_box = $22,
             location_folder = $23,
             location_file_number = $24,
             updated_at = NOW()
         WHERE id = $25
         RETURNING *`,
        [
          input.title,
          input.documentNumber,
          input.unitId,
          input.documentType,
          input.fileType,
          input.year,
          input.status,
          input.classification,
          input.archiveCategory,
          input.description,
          input.filePath || null,
          input.fileOriginalName || null,
          input.fileSize || null,
          input.letterNumber || null,
          input.archiveDate || null,
          input.securityLevel || "Biasa",
          input.activeRetention || 0,
          input.inactiveRetention || 0,
          input.lifecycleStatus || "Aktif",
          input.locationRoom || null,
          input.locationRack || null,
          input.locationBox || null,
          input.locationFolder || null,
          input.locationFileNumber || null,
          req.params.id
        ]
      );

      if (input.lifecycleStatus !== existing.lifecycle_status) {
        await query(
          `INSERT INTO archive_lifecycle_logs (archive_id, stage, officer_id, notes, is_approved)
           VALUES ($1, $2, $3, $4, TRUE)`,
          [req.params.id, input.lifecycleStatus, req.user.id, `Status siklus hidup diubah secara manual menjadi: ${input.lifecycleStatus}.`]
        );
      }

      await logActivity({
        userId: req.user.id,
        action: "UPDATE",
        entity: "archive",
        entityId: Number(req.params.id),
        metadata: { title: input.title }
      });

      res.json({ data: result.rows[0] });
    } catch (error) {
      if (error.code === "23505") {
        throw createHttpError(409, "Nomor dokumen sudah digunakan");
      }
      throw error;
    }
  })
);

router.delete(
  "/:id",
  authenticate,
  requireArchivePermission(canDeleteArchive, "Hanya Admin atau divisi pemilik arsip yang dapat menghapus arsip ini"),
  asyncHandler(async (req, res) => {
    const existing = req.archive;
    ensureArchiveActive(existing);

    await query(
      `UPDATE archives
       SET deleted_at = NOW(),
           deleted_by = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [req.user.id, req.params.id]
    );

    await logActivity({
      userId: req.user.id,
      action: "DELETE",
      entity: "archive",
      entityId: Number(req.params.id),
      metadata: { title: existing.title }
    });

    res.status(204).send();
  })
);

router.post(
  "/:id/restore",
  authenticate,
  requireArchivePermission(canDeleteArchive, "Hanya Admin atau divisi pemilik arsip yang dapat merestore arsip ini"),
  asyncHandler(async (req, res) => {
    const existing = req.archive;
    if (!existing.deleted_at) {
      throw createHttpError(409, "Arsip ini tidak berada di sampah");
    }

    const result = await query(
      `UPDATE archives
       SET deleted_at = NULL,
           deleted_by = NULL,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    await logActivity({
      userId: req.user.id,
      action: "RESTORE",
      entity: "archive",
      entityId: Number(req.params.id),
      metadata: { title: existing.title }
    });

    res.json({ data: result.rows[0] });
  })
);

router.post(
  "/:id/move-location",
  authenticate,
  requireArchivePermission(canEditArchive, "Hanya Admin atau divisi pemilik arsip yang dapat memindahkan lokasi arsip ini"),
  asyncHandler(async (req, res) => {
    const existing = req.archive;
    ensureArchiveActive(existing);

    const oldLocation = getLocationFields(existing);
    const nextLocation = getLocationFields(req.body, oldLocation);
    const notes = cleanText(req.body.notes) || "";

    const result = await query(
      `UPDATE archives
       SET location_room = $1,
           location_rack = $2,
           location_box = $3,
           location_folder = $4,
           location_file_number = $5,
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [
        nextLocation.room || null,
        nextLocation.rack || null,
        nextLocation.box || null,
        nextLocation.folder || null,
        nextLocation.fileNumber || null,
        req.params.id
      ]
    );

    await query(
      `INSERT INTO archive_location_logs (
        archive_id,
        old_room, old_rack, old_box, old_folder, old_file_number,
        new_room, new_rack, new_box, new_folder, new_file_number,
        notes,
        moved_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        req.params.id,
        oldLocation.room || null,
        oldLocation.rack || null,
        oldLocation.box || null,
        oldLocation.folder || null,
        oldLocation.fileNumber || null,
        nextLocation.room || null,
        nextLocation.rack || null,
        nextLocation.box || null,
        nextLocation.folder || null,
        nextLocation.fileNumber || null,
        notes || null,
        req.user.id
      ]
    );

    await logActivity({
      userId: req.user.id,
      action: "MOVE_LOCATION",
      entity: "archive",
      entityId: Number(req.params.id),
      metadata: {
        from: oldLocation,
        to: nextLocation
      }
    });

    res.json({ data: result.rows[0], message: "Lokasi fisik arsip berhasil diperbarui." });
  })
);

router.post(
  "/:id/stock-opname",
  authenticate,
  requireArchivePermission(canEditArchive, "Hanya Admin atau divisi pemilik arsip yang dapat mengisi stock opname arsip ini"),
  asyncHandler(async (req, res) => {
    const existing = req.archive;
    ensureArchiveActive(existing);

    const status = cleanText(req.body.status);
    if (!STOCK_OPNAME_STATUSES.includes(status)) {
      throw createHttpError(422, "Status stock opname tidak valid");
    }

    const notes = cleanText(req.body.notes) || "";
    const observedLocation = {
      room: cleanText(req.body.observedRoom || req.body.observed_room) || "",
      rack: cleanText(req.body.observedRack || req.body.observed_rack) || "",
      box: cleanText(req.body.observedBox || req.body.observed_box) || "",
      folder: cleanText(req.body.observedFolder || req.body.observed_folder) || "",
      fileNumber: cleanText(req.body.observedFileNumber || req.body.observed_file_number) || ""
    };
    const shouldApplyLocation = parseBooleanValue(req.body.applyLocationUpdate);

    const opnameResult = await query(
      `INSERT INTO archive_stock_opnames (
        archive_id,
        checked_by,
        status,
        observed_room,
        observed_rack,
        observed_box,
        observed_folder,
        observed_file_number,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        req.params.id,
        req.user.id,
        status,
        observedLocation.room || null,
        observedLocation.rack || null,
        observedLocation.box || null,
        observedLocation.folder || null,
        observedLocation.fileNumber || null,
        notes || null
      ]
    );

    if (shouldApplyLocation) {
      const oldLocation = getLocationFields(existing);
      const newLocation = {
        room: observedLocation.room || oldLocation.room,
        rack: observedLocation.rack || oldLocation.rack,
        box: observedLocation.box || oldLocation.box,
        folder: observedLocation.folder || oldLocation.folder,
        fileNumber: observedLocation.fileNumber || oldLocation.fileNumber
      };

      await query(
        `UPDATE archives
         SET location_room = $1,
             location_rack = $2,
             location_box = $3,
             location_folder = $4,
             location_file_number = $5,
             updated_at = NOW()
         WHERE id = $6`,
        [
          newLocation.room || null,
          newLocation.rack || null,
          newLocation.box || null,
          newLocation.folder || null,
          newLocation.fileNumber || null,
          req.params.id
        ]
      );

      await query(
        `INSERT INTO archive_location_logs (
          archive_id,
          old_room, old_rack, old_box, old_folder, old_file_number,
          new_room, new_rack, new_box, new_folder, new_file_number,
          notes,
          moved_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          req.params.id,
          oldLocation.room || null,
          oldLocation.rack || null,
          oldLocation.box || null,
          oldLocation.folder || null,
          oldLocation.fileNumber || null,
          newLocation.room || null,
          newLocation.rack || null,
          newLocation.box || null,
          newLocation.folder || null,
          newLocation.fileNumber || null,
          `Perubahan lokasi dari stock opname. ${notes}`.trim(),
          req.user.id
        ]
      );
    }

    await logActivity({
      userId: req.user.id,
      action: "STOCK_OPNAME",
      entity: "archive",
      entityId: Number(req.params.id),
      metadata: {
        status,
        appliedLocationUpdate: shouldApplyLocation
      }
    });

    res.status(201).json({
      data: opnameResult.rows[0],
      message: "Stock opname arsip berhasil dicatat."
    });
  })
);

router.post(
  "/:id/comments",
  authenticate,
  requireArchivePermission(canViewArchive, "Anda tidak dapat melihat arsip ini"),
  validateBody(commentSchema),
  asyncHandler(async (req, res) => {
    ensureArchiveActive(req.archive);
    const result = await query(
      `INSERT INTO archive_comments (archive_id, user_id, comment)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.params.id, req.user.id, req.body.comment]
    );

    await logActivity({
      userId: req.user.id,
      action: "COMMENT",
      entity: "archive",
      entityId: Number(req.params.id)
    });

    res.status(201).json({ data: result.rows[0] });
  })
);

router.post(
  "/:id/verify",
  authenticate,
  requireArchivePermission(canUpdateArchiveStatus, "Anda tidak dapat mengubah status arsip ini"),
  validateBody(verifySchema),
  asyncHandler(async (req, res) => {
    ensureArchiveActive(req.archive);
    const verified = ["Terverifikasi", "Diarsipkan"].includes(req.body.status);

    const result = await query(
      `UPDATE archives
       SET status = $1,
           verified_by = CASE WHEN $2 THEN $3 ELSE verified_by END,
           verified_at = CASE WHEN $2 THEN NOW() ELSE verified_at END,
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [req.body.status, verified, req.user.id, req.params.id]
    );

    if (req.body.note) {
      await query(
        "INSERT INTO archive_comments (archive_id, user_id, comment) VALUES ($1, $2, $3)",
        [req.params.id, req.user.id, req.body.note]
      );
    }

    await logActivity({
      userId: req.user.id,
      action: "VERIFY",
      entity: "archive",
      entityId: Number(req.params.id),
      metadata: { status: req.body.status }
    });

    res.json({ data: result.rows[0] });
  })
);

router.get(
  "/:id/preview",
  authenticate,
  requireArchivePermission(canViewArchive, "Anda tidak dapat melihat arsip ini"),
  asyncHandler(async (req, res) => {
    const archive = req.archive;
    ensureArchiveActive(archive);

    const egress = await enforceDataEgressPolicy(req, {
      operation: "archive_preview",
      entityId: archive.id,
      classification: archive.security_level
    });

    await logActivity({
      userId: req.user.id,
      action: "PREVIEW",
      entity: "archive",
      entityId: archive.id,
      metadata: { documentNumber: archive.document_number, egressWeight: 1, projectedEgressCount: egress.projected }
    });

    if (archive.file_path) {
      if (await storedObjectExists(archive.file_path)) {
        let mimeType = "application/octet-stream";
        const ext = archive.file_type ? archive.file_type.toUpperCase() : "";
        if (ext === "PDF") mimeType = "application/pdf";
        else if (ext === "JPG" || ext === "JPEG") mimeType = "image/jpeg";
        else if (ext === "PNG") mimeType = "image/png";
        else if (ext === "TIFF" || ext === "TIF") mimeType = "image/tiff";

        return sendStoredObject(res, archive.file_path, {
          disposition: "inline",
          contentType: mimeType,
          req
        });
      }
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", "inline");
    return res.send(
      [
        "SIPADI - Dokumen dummy (Preview)",
        `Nomor: ${archive.document_number}`,
        `Judul: ${archive.title}`,
        `Status: ${archive.status}`,
        "",
        "File asli belum tersedia karena data seed menggunakan dokumen dummy."
      ].join("\n")
    );
  })
);

router.get(
  "/:id/download",
  authenticate,
  requireArchivePermission(canDownloadArchive, "Anda tidak dapat mengunduh arsip ini"),
  asyncHandler(async (req, res) => {
    const archive = req.archive;
    ensureArchiveActive(archive);

    const egress = await enforceDataEgressPolicy(req, {
      operation: "archive_download",
      entityId: archive.id,
      classification: archive.security_level
    });

    await logActivity({
      userId: req.user.id,
      action: "DOWNLOAD",
      entity: "archive",
      entityId: archive.id,
      metadata: { documentNumber: archive.document_number, egressWeight: 1, projectedEgressCount: egress.projected }
    });

    // Broadcast notifikasi download ke semua user
    await createNotification({
      broadcast: true,
      title: "Arsip Diunduh",
      message: `${req.user.name} mengunduh arsip "${archive.title}" (${archive.document_number}).`,
      type: "archive_downloaded",
      entityId: archive.id
    });

    if (archive.file_path) {
      if (await storedObjectExists(archive.file_path)) {
        return sendStoredObject(res, archive.file_path, {
          filename: archive.file_original_name || `arsip-${archive.id}`,
          req
        });
      }
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="arsip-${archive.id}.txt"`);
    return res.send(
      [
        "SIPADI - Dokumen dummy",
        `Nomor: ${archive.document_number}`,
        `Judul: ${archive.title}`,
        `Status: ${archive.status}`,
        "",
        "File asli belum tersedia karena data seed menggunakan dokumen dummy."
      ].join("\n")
    );
  })
);

export default router;
