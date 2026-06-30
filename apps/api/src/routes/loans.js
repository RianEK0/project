import { Router } from "express";
import { query } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler, createHttpError } from "../utils/http.js";
import { createNotification } from "../services/notificationService.js";
import { logActivity } from "../services/audit.js";

const router = Router();

// POST /api/loans/request
router.post(
  "/request",
  authenticate,
  asyncHandler(async (req, res) => {
    const { archiveId, reason } = req.body;

    if (!archiveId || !reason || !reason.trim()) {
      throw createHttpError(422, "ID arsip dan alasan peminjaman wajib diisi");
    }

    const archiveResult = await query(
      "SELECT id, title, document_number, created_by, unit_id FROM archives WHERE id = $1",
      [archiveId]
    );

    if (archiveResult.rows.length === 0) {
      throw createHttpError(404, "Arsip tidak ditemukan");
    }

    const archive = archiveResult.rows[0];

    // Check if duplicate request exists
    const existingResult = await query(
      "SELECT id, status FROM archive_loans WHERE archive_id = $1 AND user_id = $2",
      [archive.id, req.user.id]
    );

    let loan;
    if (existingResult.rows.length > 0) {
      const existing = existingResult.rows[0];
      if (existing.status === "Menunggu Persetujuan") {
        throw createHttpError(409, "Permohonan akses sedang diproses");
      }

      // If rejected/approved previously, we reset it to pending
      const updateResult = await query(
        `UPDATE archive_loans 
         SET reason = $1, status = 'Menunggu Persetujuan', notes = NULL, approved_by = NULL, approved_at = NULL, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [reason.trim(), existing.id]
      );
      loan = updateResult.rows[0];
    } else {
      // Insert new request
      const insertResult = await query(
        `INSERT INTO archive_loans (archive_id, user_id, reason)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [archive.id, req.user.id, reason.trim()]
      );
      loan = insertResult.rows[0];
    }

    await createNotification({
      broadcast: true,
      title: "Permohonan Peminjaman Arsip",
      message: `${req.user.name} memohon akses ke arsip "${archive.title}" (${archive.document_number}).`,
      type: "request_loan",
      entityId: archive.id
    });

    await logActivity({
      userId: req.user.id,
      action: "REQUEST_LOAN",
      entity: "archive_loan",
      entityId: loan.id,
      metadata: { archiveId: archive.id }
    });

    res.status(201).json({ data: loan });
  })
);

// GET /api/loans/my-requests
router.get(
  "/my-requests",
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await query(
      `SELECT l.*, a.title AS archive_title, a.document_number AS archive_document_number,
              ou.name AS archive_unit_name, u.name AS approved_by_name
       FROM archive_loans l
       JOIN archives a ON a.id = l.archive_id
       JOIN organization_units ou ON ou.id = a.unit_id
       LEFT JOIN users u ON u.id = l.approved_by
       WHERE l.user_id = $1
       ORDER BY l.updated_at DESC`,
      [req.user.id]
    );

    res.json({ data: result.rows });
  })
);

// GET /api/loans/approvals
router.get(
  "/approvals",
  authenticate,
  asyncHandler(async (req, res) => {
    let result;

    if (req.user.role === "Admin") {
      result = await query(
        `SELECT l.*, a.title AS archive_title, a.document_number AS archive_document_number,
                requester.name AS requester_name, requester.role AS requester_role
         FROM archive_loans l
         JOIN archives a ON a.id = l.archive_id
         JOIN users requester ON requester.id = l.user_id
         ORDER BY l.status = 'Menunggu Persetujuan' DESC, l.updated_at DESC`
      );
    } else {
      // Find requests for archives created by current user or within their unit (if Sub Bag)
      result = await query(
        `SELECT l.*, a.title AS archive_title, a.document_number AS archive_document_number,
                requester.name AS requester_name, requester.role AS requester_role
         FROM archive_loans l
         JOIN archives a ON a.id = l.archive_id
         JOIN users requester ON requester.id = l.user_id
         WHERE a.created_by = $1 
            OR ($2 = 'Sub Bag' AND a.unit_id = $3)
         ORDER BY l.status = 'Menunggu Persetujuan' DESC, l.updated_at DESC`,
        [req.user.id, req.user.role, req.user.unitId]
      );
    }

    res.json({ data: result.rows });
  })
);

// POST /api/loans/:id/approve
router.post(
  "/:id/approve",
  authenticate,
  asyncHandler(async (req, res) => {
    const loanId = req.params.id;

    const loanResult = await query(
      `SELECT l.*, a.created_by AS archive_creator, a.unit_id AS archive_unit_id, a.title AS archive_title
       FROM archive_loans l
       JOIN archives a ON a.id = l.archive_id
       WHERE l.id = $1`,
      [loanId]
    );

    if (loanResult.rows.length === 0) {
      throw createHttpError(404, "Permohonan peminjaman tidak ditemukan");
    }

    const loan = loanResult.rows[0];

    // Authorization: Admin, creator of the archive, or Sub Bag of the archive's unit
    const isAuthorized =
      req.user.role === "Admin" ||
      loan.archive_creator === req.user.id ||
      (req.user.role === "Sub Bag" && Number(loan.archive_unit_id) === Number(req.user.unitId));

    if (!isAuthorized) {
      throw createHttpError(403, "Anda tidak berwenang menyetujui permohonan ini");
    }

    const updateResult = await query(
      `UPDATE archive_loans
       SET status = 'Disetujui', approved_by = $1, approved_at = NOW(), updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [req.user.id, loanId]
    );

    // Notify all users
    await createNotification({
      broadcast: true,
      title: "Permohonan Peminjaman Disetujui",
      message: `Permohonan akses ke arsip "${loan.archive_title}" oleh user #${loan.user_id} telah DISETUJUI oleh ${req.user.name}.`,
      type: "loan_approved",
      entityId: loan.archive_id
    });

    await logActivity({
      userId: req.user.id,
      action: "APPROVE_LOAN",
      entity: "archive_loan",
      entityId: Number(loanId),
      metadata: { requesterId: loan.user_id }
    });

    res.json({ data: updateResult.rows[0] });
  })
);

// POST /api/loans/:id/reject
router.post(
  "/:id/reject",
  authenticate,
  asyncHandler(async (req, res) => {
    const loanId = req.params.id;
    const { notes } = req.body;

    const loanResult = await query(
      `SELECT l.*, a.created_by AS archive_creator, a.unit_id AS archive_unit_id, a.title AS archive_title
       FROM archive_loans l
       JOIN archives a ON a.id = l.archive_id
       WHERE l.id = $1`,
      [loanId]
    );

    if (loanResult.rows.length === 0) {
      throw createHttpError(404, "Permohonan peminjaman tidak ditemukan");
    }

    const loan = loanResult.rows[0];

    // Authorization
    const isAuthorized =
      req.user.role === "Admin" ||
      loan.archive_creator === req.user.id ||
      (req.user.role === "Sub Bag" && Number(loan.archive_unit_id) === Number(req.user.unitId));

    if (!isAuthorized) {
      throw createHttpError(403, "Anda tidak berwenang menolak permohonan ini");
    }

    const updateResult = await query(
      `UPDATE archive_loans
       SET status = 'Ditolak', notes = $1, approved_by = $2, approved_at = NOW(), updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [notes ? notes.trim() : "", req.user.id, loanId]
    );

    // Notify all users
    await createNotification({
      broadcast: true,
      title: "Permohonan Peminjaman Ditolak",
      message: `Permohonan akses ke arsip "${loan.archive_title}" telah DITOLAK oleh ${req.user.name}.`,
      type: "loan_rejected",
      entityId: loan.archive_id
    });

    await logActivity({
      userId: req.user.id,
      action: "REJECT_LOAN",
      entity: "archive_loan",
      entityId: Number(loanId),
      metadata: { requesterId: loan.user_id }
    });

    res.json({ data: updateResult.rows[0] });
  })
);

export default router;
