import { Router } from "express";
import { query } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler, createHttpError } from "../utils/http.js";
import { createNotification, getManagerialUserIds } from "../services/notificationService.js";
import { logActivity } from "../services/audit.js";

const router = Router();

const GLOBAL_ROLES = ["Admin", "Inspektur", "Sekretaris", "Umpeg"];

const loanListSelectSql = `
  SELECT l.*, a.title AS archive_title, a.document_number AS archive_document_number,
         ou.name AS archive_unit_name,
         requester.name AS requester_name, requester.role AS requester_role,
         approver.name AS approved_by_name, returner.name AS returned_by_name,
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
  JOIN archives a ON a.id = l.archive_id
  JOIN organization_units ou ON ou.id = a.unit_id
  JOIN users requester ON requester.id = l.user_id
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

function isGlobalLoanManager(user) {
  return GLOBAL_ROLES.includes(user.role);
}

function canReturnLoan(user, loan) {
  return isGlobalLoanManager(user) || Number(loan.user_id) === Number(user.id);
}

function cleanValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isDateString(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function ensureLoanPeriod(loanDate, loanDeadline) {
  if (!isDateString(loanDate) || !isDateString(loanDeadline)) {
    throw createHttpError(422, "Tanggal mulai dan batas peminjaman wajib menggunakan format tanggal yang valid");
  }

  if (loanDeadline < loanDate) {
    throw createHttpError(422, "Batas peminjaman tidak boleh lebih awal dari tanggal mulai");
  }
}

function ensureExtensionDeadline(currentDeadline, requestedDeadline) {
  if (!currentDeadline) {
    throw createHttpError(409, "Peminjaman ini belum memiliki batas pengembalian yang bisa diperpanjang");
  }

  if (!isDateString(requestedDeadline)) {
    throw createHttpError(422, "Tanggal perpanjangan wajib menggunakan format tanggal yang valid");
  }

  if (requestedDeadline <= currentDeadline) {
    throw createHttpError(422, "Tanggal perpanjangan harus melewati batas peminjaman saat ini");
  }
}

async function getLoanById(loanId) {
  const loanResult = await query(
    `SELECT l.*, a.title AS archive_title, a.document_number AS archive_document_number,
            requester.name AS requester_name, requester.role AS requester_role
     FROM archive_loans l
     JOIN archives a ON a.id = l.archive_id
     JOIN users requester ON requester.id = l.user_id
     WHERE l.id = $1`,
    [loanId]
  );

  if (loanResult.rows.length === 0) {
    throw createHttpError(404, "Permohonan peminjaman tidak ditemukan");
  }

  return loanResult.rows[0];
}

async function getLatestLoanHistory(loanId) {
  const result = await query(
    `SELECT *
     FROM archive_loan_histories
     WHERE loan_id = $1
     ORDER BY created_at DESC, id DESC
     LIMIT 1`,
    [loanId]
  );

  return result.rows[0] || null;
}

async function createLoanHistoryCycle(loan, options = {}) {
  const result = await query(
    `INSERT INTO archive_loan_histories (
      loan_id,
      archive_id,
      user_id,
      reason,
      status,
      notes,
      approved_by,
      approved_at,
      loan_date,
      loan_deadline,
      return_notes,
      returned_by,
      returned_at,
      created_at,
      updated_at
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8,
      $9, $10, $11, $12, $13,
      COALESCE($14::timestamptz, NOW()),
      COALESCE($15::timestamptz, NOW())
    )
    RETURNING *`,
    [
      loan.id,
      loan.archive_id,
      loan.user_id,
      loan.reason,
      loan.status,
      loan.notes || null,
      loan.approved_by || null,
      loan.approved_at || null,
      loan.loan_date || null,
      loan.loan_deadline || null,
      loan.return_notes || null,
      loan.returned_by || null,
      loan.returned_at || null,
      options.createdAt || null,
      options.updatedAt || null
    ]
  );

  return result.rows[0];
}

async function ensureLoanHistory(loan) {
  const history = await getLatestLoanHistory(loan.id);
  if (history) {
    return history;
  }

  return createLoanHistoryCycle(loan, {
    createdAt: loan.created_at || null,
    updatedAt: loan.updated_at || null
  });
}

async function syncLatestLoanHistory(loan) {
  const history = await ensureLoanHistory(loan);
  await query(
    `UPDATE archive_loan_histories
     SET archive_id = $1,
         user_id = $2,
         reason = $3,
         status = $4,
         notes = $5,
         approved_by = $6,
         approved_at = $7,
         loan_date = $8,
         loan_deadline = $9,
         return_notes = $10,
         returned_by = $11,
         returned_at = $12,
         updated_at = NOW()
     WHERE id = $13`,
    [
      loan.archive_id,
      loan.user_id,
      loan.reason,
      loan.status,
      loan.notes || null,
      loan.approved_by || null,
      loan.approved_at || null,
      loan.loan_date || null,
      loan.loan_deadline || null,
      loan.return_notes || null,
      loan.returned_by || null,
      loan.returned_at || null,
      history.id
    ]
  );

  return history;
}

async function closePendingLoanExtensions(historyId, reviewerId, reviewNotes) {
  await query(
    `UPDATE archive_loan_extensions
     SET status = 'Ditolak',
         review_notes = COALESCE(review_notes, $1),
         reviewed_by = COALESCE(reviewed_by, $2),
         reviewed_at = COALESCE(reviewed_at, NOW()),
         updated_at = NOW()
     WHERE loan_history_id = $3
       AND status = 'Menunggu Persetujuan'`,
    [reviewNotes, reviewerId, historyId]
  );
}

async function getExtensionById(extensionId) {
  const result = await query(
    `SELECT e.*, l.archive_id, l.user_id, l.status AS loan_status, l.loan_deadline,
            a.title AS archive_title, a.document_number AS archive_document_number,
            requester.name AS requester_name, requester.role AS requester_role
     FROM archive_loan_extensions e
     JOIN archive_loans l ON l.id = e.loan_id
     JOIN archives a ON a.id = l.archive_id
     JOIN users requester ON requester.id = l.user_id
     WHERE e.id = $1`,
    [extensionId]
  );

  if (result.rows.length === 0) {
    throw createHttpError(404, "Permintaan perpanjangan tidak ditemukan");
  }

  return result.rows[0];
}

// POST /api/loans/request
router.post(
  "/request",
  authenticate,
  asyncHandler(async (req, res) => {
    const archiveId = req.body?.archiveId;
    const reason = cleanValue(req.body?.reason);
    const loanDate = req.body?.loanDate;
    const loanDeadline = req.body?.loanDeadline;

    if (!archiveId || !reason || !loanDate || !loanDeadline) {
      throw createHttpError(422, "ID arsip, alasan peminjaman, tanggal mulai, dan batas tanggal wajib diisi");
    }

    ensureLoanPeriod(loanDate, loanDeadline);

    const archiveResult = await query(
      "SELECT id, title, document_number, created_by, unit_id FROM archives WHERE id = $1",
      [archiveId]
    );

    if (archiveResult.rows.length === 0) {
      throw createHttpError(404, "Arsip tidak ditemukan");
    }

    const archive = archiveResult.rows[0];
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
      if (existing.status === "Disetujui") {
        throw createHttpError(409, "Arsip ini masih dalam status dipinjam. Kembalikan dulu sebelum mengajukan ulang");
      }

      const updateResult = await query(
        `UPDATE archive_loans
         SET reason = $1,
             loan_date = $2,
             loan_deadline = $3,
             status = 'Menunggu Persetujuan',
             notes = NULL,
             approved_by = NULL,
             approved_at = NULL,
             return_notes = NULL,
             returned_by = NULL,
             returned_at = NULL,
             updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [reason, loanDate, loanDeadline, existing.id]
      );
      loan = updateResult.rows[0];
    } else {
      const insertResult = await query(
        `INSERT INTO archive_loans (archive_id, user_id, reason, loan_date, loan_deadline)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [archive.id, req.user.id, reason, loanDate, loanDeadline]
      );
      loan = insertResult.rows[0];
    }

    await createLoanHistoryCycle(loan);

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
      `${loanListSelectSql}
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

    if (isGlobalLoanManager(req.user)) {
      result = await query(
        `${loanListSelectSql}
         ORDER BY
           CASE
             WHEN l.status = 'Menunggu Persetujuan' THEN 0
             WHEN ext.extension_status = 'Menunggu Persetujuan' THEN 1
             ELSE 2
           END,
           l.updated_at DESC,
           ext.extension_requested_at DESC NULLS LAST`
      );
    } else {
      result = await query(
        `${loanListSelectSql}
         WHERE l.user_id = $1
         ORDER BY l.updated_at DESC`,
        [req.user.id]
      );
    }

    res.json({ data: result.rows });
  })
);

// POST /api/loans/:id/request-extension
router.post(
  "/:id/request-extension",
  authenticate,
  asyncHandler(async (req, res) => {
    const loan = await getLoanById(req.params.id);
    const reason = cleanValue(req.body?.reason);
    const requestedDeadline = req.body?.requestedDeadline;

    if (Number(loan.user_id) !== Number(req.user.id)) {
      throw createHttpError(403, "Hanya peminjam yang dapat meminta perpanjangan");
    }
    if (loan.status !== "Disetujui") {
      throw createHttpError(409, "Hanya peminjaman aktif yang dapat diperpanjang");
    }
    if (!reason) {
      throw createHttpError(422, "Alasan perpanjangan wajib diisi");
    }

    ensureExtensionDeadline(loan.loan_deadline, requestedDeadline);

    const history = await ensureLoanHistory(loan);
    const pendingExtensionResult = await query(
      `SELECT id
       FROM archive_loan_extensions
       WHERE loan_history_id = $1
         AND status = 'Menunggu Persetujuan'
       LIMIT 1`,
      [history.id]
    );

    if (pendingExtensionResult.rows.length > 0) {
      throw createHttpError(409, "Masih ada permintaan perpanjangan yang belum ditinjau");
    }

    const extensionResult = await query(
      `INSERT INTO archive_loan_extensions (
        loan_history_id,
        loan_id,
        requested_by,
        current_deadline,
        requested_deadline,
        reason
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [history.id, loan.id, req.user.id, loan.loan_deadline, requestedDeadline, reason]
    );

    const managerialUserIds = await getManagerialUserIds();
    await createNotification({
      userIds: [req.user.id, ...managerialUserIds],
      title: "Permintaan Perpanjangan Peminjaman",
      message: `${req.user.name} meminta perpanjangan peminjaman arsip "${loan.archive_title}" sampai ${requestedDeadline}.`,
      type: "loan_extension_requested",
      entityId: loan.id
    });

    await logActivity({
      userId: req.user.id,
      action: "REQUEST_LOAN_EXTENSION",
      entity: "archive_loan_extension",
      entityId: extensionResult.rows[0].id,
      metadata: { loanId: loan.id, archiveId: loan.archive_id, requestedDeadline }
    });

    res.status(201).json({ data: extensionResult.rows[0] });
  })
);

// POST /api/loans/extensions/:extensionId/approve
router.post(
  "/extensions/:extensionId/approve",
  authenticate,
  asyncHandler(async (req, res) => {
    const extension = await getExtensionById(req.params.extensionId);
    const reviewNotes = cleanValue(req.body?.notes);

    if (!isGlobalLoanManager(req.user)) {
      throw createHttpError(403, "Anda tidak berwenang menyetujui perpanjangan peminjaman");
    }
    if (extension.status !== "Menunggu Persetujuan") {
      throw createHttpError(409, "Permintaan perpanjangan ini sudah pernah diproses");
    }
    if (extension.loan_status !== "Disetujui") {
      throw createHttpError(409, "Peminjaman sudah tidak aktif sehingga perpanjangan tidak dapat disetujui");
    }

    const extensionResult = await query(
      `UPDATE archive_loan_extensions
       SET status = 'Disetujui',
           review_notes = $1,
           reviewed_by = $2,
           reviewed_at = NOW(),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [reviewNotes || null, req.user.id, extension.id]
    );

    const loanResult = await query(
      `UPDATE archive_loans
       SET loan_deadline = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [extension.requested_deadline, extension.loan_id]
    );

    await syncLatestLoanHistory(loanResult.rows[0]);

    await createNotification({
      userIds: [extension.user_id],
      title: "Perpanjangan Peminjaman Disetujui",
      message: `Permintaan perpanjangan arsip "${extension.archive_title}" disetujui sampai ${extension.requested_deadline} oleh ${req.user.name}.`,
      type: "loan_extension_approved",
      entityId: extension.loan_id
    });

    await logActivity({
      userId: req.user.id,
      action: "APPROVE_LOAN_EXTENSION",
      entity: "archive_loan_extension",
      entityId: extension.id,
      metadata: { loanId: extension.loan_id, archiveId: extension.archive_id, requestedDeadline: extension.requested_deadline }
    });

    res.json({ data: { extension: extensionResult.rows[0], loan: loanResult.rows[0] } });
  })
);

// POST /api/loans/extensions/:extensionId/reject
router.post(
  "/extensions/:extensionId/reject",
  authenticate,
  asyncHandler(async (req, res) => {
    const extension = await getExtensionById(req.params.extensionId);
    const reviewNotes = cleanValue(req.body?.notes);

    if (!isGlobalLoanManager(req.user)) {
      throw createHttpError(403, "Anda tidak berwenang menolak perpanjangan peminjaman");
    }
    if (extension.status !== "Menunggu Persetujuan") {
      throw createHttpError(409, "Permintaan perpanjangan ini sudah pernah diproses");
    }

    const extensionResult = await query(
      `UPDATE archive_loan_extensions
       SET status = 'Ditolak',
           review_notes = $1,
           reviewed_by = $2,
           reviewed_at = NOW(),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [reviewNotes || null, req.user.id, extension.id]
    );

    await createNotification({
      userIds: [extension.user_id],
      title: "Perpanjangan Peminjaman Ditolak",
      message: `Permintaan perpanjangan arsip "${extension.archive_title}" ditolak oleh ${req.user.name}.`,
      type: "loan_extension_rejected",
      entityId: extension.loan_id
    });

    await logActivity({
      userId: req.user.id,
      action: "REJECT_LOAN_EXTENSION",
      entity: "archive_loan_extension",
      entityId: extension.id,
      metadata: { loanId: extension.loan_id, archiveId: extension.archive_id }
    });

    res.json({ data: extensionResult.rows[0] });
  })
);

// POST /api/loans/:id/approve
router.post(
  "/:id/approve",
  authenticate,
  asyncHandler(async (req, res) => {
    const loanId = req.params.id;
    const loan = await getLoanById(loanId);

    if (!isGlobalLoanManager(req.user)) {
      throw createHttpError(403, "Anda tidak berwenang menyetujui permohonan ini");
    }
    if (loan.status !== "Menunggu Persetujuan") {
      throw createHttpError(409, "Hanya permohonan yang masih menunggu persetujuan yang dapat disetujui");
    }

    await ensureLoanHistory(loan);

    const updateResult = await query(
      `UPDATE archive_loans
       SET status = 'Disetujui',
           approved_by = $1,
           approved_at = NOW(),
           loan_date = COALESCE(loan_date, CURRENT_DATE),
           loan_deadline = COALESCE(loan_deadline, CURRENT_DATE + INTERVAL '14 days'),
           return_notes = NULL,
           returned_by = NULL,
           returned_at = NULL,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [req.user.id, loanId]
    );

    await syncLatestLoanHistory(updateResult.rows[0]);

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
    const notes = cleanValue(req.body?.notes);
    const loan = await getLoanById(loanId);

    if (!isGlobalLoanManager(req.user)) {
      throw createHttpError(403, "Anda tidak berwenang menolak permohonan ini");
    }
    if (loan.status !== "Menunggu Persetujuan") {
      throw createHttpError(409, "Hanya permohonan yang masih menunggu persetujuan yang dapat ditolak");
    }

    await ensureLoanHistory(loan);

    const updateResult = await query(
      `UPDATE archive_loans
       SET status = 'Ditolak',
           notes = $1,
           approved_by = $2,
           approved_at = NOW(),
           return_notes = NULL,
           returned_by = NULL,
           returned_at = NULL,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [notes || "", req.user.id, loanId]
    );

    await syncLatestLoanHistory(updateResult.rows[0]);

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

// POST /api/loans/:id/return
router.post(
  "/:id/return",
  authenticate,
  asyncHandler(async (req, res) => {
    const loanId = req.params.id;
    const notes = cleanValue(req.body?.notes);
    const loan = await getLoanById(loanId);

    if (!canReturnLoan(req.user, loan)) {
      throw createHttpError(403, "Anda tidak berwenang menandai peminjaman ini sebagai sudah dikembalikan");
    }
    if (loan.status !== "Disetujui") {
      throw createHttpError(409, "Hanya peminjaman yang sedang aktif yang dapat dikembalikan");
    }

    const history = await ensureLoanHistory(loan);

    const updateResult = await query(
      `UPDATE archive_loans
       SET status = 'Dikembalikan',
           return_notes = $1,
           returned_by = $2,
           returned_at = NOW(),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [notes || null, req.user.id, loanId]
    );

    await syncLatestLoanHistory(updateResult.rows[0]);
    await closePendingLoanExtensions(history.id, req.user.id, "Permintaan perpanjangan ditutup karena arsip sudah dikembalikan.");

    await createNotification({
      broadcast: true,
      title: "Arsip Dikembalikan",
      message: `Peminjaman arsip "${loan.archive_title}" telah ditandai selesai oleh ${req.user.name}.`,
      type: "loan_returned",
      entityId: loan.archive_id
    });

    await logActivity({
      userId: req.user.id,
      action: "RETURN_LOAN",
      entity: "archive_loan",
      entityId: Number(loanId),
      metadata: { requesterId: loan.user_id, archiveId: loan.archive_id }
    });

    res.json({ data: updateResult.rows[0] });
  })
);

export default router;
