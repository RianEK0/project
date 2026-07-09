import fs from "fs";
import { Router } from "express";
import { z } from "zod";
import { query } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";
import { requireArchivePermission } from "../middleware/archivePermissions.js";
import { archiveUpload, resolveUploadPath, uploadedFileToDb } from "../middleware/upload.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler, cleanText, createHttpError, pagination, parseOptionalInt } from "../utils/http.js";
import { logActivity } from "../services/audit.js";
import { createNotification } from "../services/notificationService.js";
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
    ...uploaded
  };
}

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
  asyncHandler(async (req, res) => {
    const input = archiveInput(req);

    try {
      const result = await query(
        `INSERT INTO archives (
          title, document_number, unit_id, document_type, file_type, year, status, classification, archive_category,
          description, file_path, file_original_name, file_size, created_by,
          letter_number, archive_date, security_level, active_retention, inactive_retention, lifecycle_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
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
          input.lifecycleStatus || "Aktif"
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

router.get(
  "/:id",
  authenticate,
  requireArchivePermission(canViewArchive, "Anda tidak dapat melihat arsip ini"),
  asyncHandler(async (req, res) => {
    const archiveResult = await query(
      `${archiveSelectSql()}
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

    // Fetch loan info for current user
    const loanResult = await query(
      `SELECT l.*, u.name AS approved_by_name
       FROM archive_loans l
       LEFT JOIN users u ON u.id = l.approved_by
       WHERE l.archive_id = $1 AND l.user_id = $2`,
      [req.params.id, req.user.id]
    );

    res.json({
      data: {
        ...archiveResult.rows[0],
        comments: commentsResult.rows,
        dispositions: dispositionsResult.rows,
        lifecycleLogs: logsResult.rows,
        loan: loanResult.rows[0] || null
      }
    });
  })
);

router.put(
  "/:id",
  authenticate,
  requireArchivePermission(canEditArchive, "Hanya Admin atau divisi pemilik arsip yang dapat mengubah data ini"),
  archiveUpload.single("file"),
  asyncHandler(async (req, res) => {
    const existing = req.archive;

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
             updated_at = NOW()
         WHERE id = $20
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
    await query("DELETE FROM archives WHERE id = $1", [req.params.id]);

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
  "/:id/comments",
  authenticate,
  requireArchivePermission(canViewArchive, "Anda tidak dapat melihat arsip ini"),
  validateBody(commentSchema),
  asyncHandler(async (req, res) => {
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

    await logActivity({
      userId: req.user.id,
      action: "PREVIEW",
      entity: "archive",
      entityId: archive.id,
      metadata: { documentNumber: archive.document_number }
    });

    if (archive.file_path) {
      const absolutePath = resolveUploadPath(archive.file_path);
      if (fs.existsSync(absolutePath)) {
        let mimeType = "application/octet-stream";
        const ext = archive.file_type ? archive.file_type.toUpperCase() : "";
        if (ext === "PDF") mimeType = "application/pdf";
        else if (ext === "JPG" || ext === "JPEG") mimeType = "image/jpeg";
        else if (ext === "PNG") mimeType = "image/png";
        else if (ext === "TIFF" || ext === "TIF") mimeType = "image/tiff";

        res.setHeader("Content-Type", mimeType);
        res.setHeader("Content-Disposition", "inline");
        return res.sendFile(absolutePath);
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

    await logActivity({
      userId: req.user.id,
      action: "DOWNLOAD",
      entity: "archive",
      entityId: archive.id,
      metadata: { documentNumber: archive.document_number }
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
      const absolutePath = resolveUploadPath(archive.file_path);
      if (fs.existsSync(absolutePath)) {
        return res.download(absolutePath, archive.file_original_name || `arsip-${archive.id}`);
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
