import fs from "fs";
import { Router } from "express";
import { query } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../utils/http.js";
import { logActivity } from "../services/audit.js";
import { createNotification } from "../services/notificationService.js";
import { archiveUpload, resolveUploadPath } from "../middleware/upload.js";

const router = Router();

// Role dengan akses global (setara admin)
const GLOBAL_ROLES = ["Admin", "Inspektur", "Sekretaris", "Umpeg"];
// Role pegawai dengan akses unit sendiri
const UNIT_ROLES = [
  "Sub Bag Perencanaan", "Sub Bag Keuangan",
  "Irban Wilayah I", "Irban Wilayah II", "Irban Wilayah III", "Irban Wilayah IV", "Irban Wilayah V"
];


// GET /api/disposals
router.get(
  "/",
  authenticate,
  asyncHandler(async (req, res) => {
    // 1. Get archives eligible for disposal (lifecycle_status = 'Aktif' and active retention expired)
    const eligiblePenyusutan = await query(
      `SELECT a.*, ou.name AS unit_name, u.name AS creator_name,
              (a.archive_date + (a.active_retention * INTERVAL '1 year'))::date AS active_end_date
       FROM archives a
       LEFT JOIN organization_units ou ON a.unit_id = ou.id
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.lifecycle_status = 'Aktif'
         AND a.status = 'Diarsipkan'
         AND CURRENT_DATE >= (a.archive_date + (a.active_retention * INTERVAL '1 year'))
       ORDER BY a.archive_date ASC`
    );

    // 2. Get archives currently in disposal pipeline or already processed
    const proposedPenyusutan = await query(
      `SELECT a.*, ou.name AS unit_name, u.name AS creator_name,
              (a.archive_date + (a.active_retention * INTERVAL '1 year'))::date AS active_end_date
       FROM archives a
       LEFT JOIN organization_units ou ON a.unit_id = ou.id
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.lifecycle_status IN ('Usulan Penyusutan', 'Review Penyusutan', 'Disetujui Penyusutan', 'Inaktif', 'Statis')
       ORDER BY a.updated_at DESC`
    );

    // 3. Get archives eligible for destruction (lifecycle_status = 'Inaktif' and inactive retention expired)
    const eligiblePemusnahan = await query(
      `SELECT a.*, ou.name AS unit_name, u.name AS creator_name,
              (a.archive_date + ((a.active_retention + a.inactive_retention) * INTERVAL '1 year'))::date AS inactive_end_date
       FROM archives a
       LEFT JOIN organization_units ou ON a.unit_id = ou.id
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.lifecycle_status = 'Inaktif'
         AND a.status = 'Diarsipkan'
         AND CURRENT_DATE >= (a.archive_date + ((a.active_retention + a.inactive_retention) * INTERVAL '1 year'))
       ORDER BY a.archive_date ASC`
    );

    // 4. Get archives in destruction pipeline or already destroyed
    const proposedPemusnahan = await query(
      `SELECT a.*, ou.name AS unit_name, u.name AS creator_name,
              (a.archive_date + ((a.active_retention + a.inactive_retention) * INTERVAL '1 year'))::date AS inactive_end_date
       FROM archives a
       LEFT JOIN organization_units ou ON a.unit_id = ou.id
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.lifecycle_status IN ('Usulan Pemusnahan', 'Verifikasi Pemusnahan', 'Disetujui Pemusnahan', 'Musnah')
       ORDER BY a.updated_at DESC`
    );

    // 5. Fetch logs for these archives
    const archiveIds = [
      ...eligiblePenyusutan.rows,
      ...proposedPenyusutan.rows,
      ...eligiblePemusnahan.rows,
      ...proposedPemusnahan.rows
    ].map((r) => r.id);

    let logs = [];
    if (archiveIds.length > 0) {
      const logsResult = await query(
        `SELECT l.*, u.name AS officer_name, u.role AS officer_role
         FROM archive_lifecycle_logs l
         LEFT JOIN users u ON l.officer_id = u.id
         WHERE l.archive_id = ANY($1)
         ORDER BY l.created_at DESC`,
        [[...new Set(archiveIds)]]
      );
      logs = logsResult.rows;
    }

    res.json({
      eligiblePenyusutan: eligiblePenyusutan.rows,
      proposedPenyusutan: proposedPenyusutan.rows,
      eligiblePemusnahan: eligiblePemusnahan.rows,
      proposedPemusnahan: proposedPemusnahan.rows,
      logs
    });
  })
);

// POST /api/disposals/:id/propose (Penyusutan)
router.post(
  "/:id/propose",
  authenticate,
  asyncHandler(async (req, res) => {
    const { notes } = req.body;
    const archiveId = req.params.id;

    // Verify archive exists and is in 'Aktif' state
    const archiveCheck = await query(
      "SELECT id, title, document_number, created_by FROM archives WHERE id = $1",
      [archiveId]
    );

    if (archiveCheck.rows.length === 0) {
      return res.status(404).json({ message: "Arsip tidak ditemukan" });
    }

    const archive = archiveCheck.rows[0];

    // Update archive lifecycle_status
    await query(
      "UPDATE archives SET lifecycle_status = 'Usulan Penyusutan', updated_at = NOW() WHERE id = $1",
      [archiveId]
    );

    // Add log
    await query(
      `INSERT INTO archive_lifecycle_logs (archive_id, stage, officer_id, notes, is_approved)
       VALUES ($1, 'Usulan Penyusutan', $2, $3, TRUE)`,
      [archiveId, req.user.id, notes || "Arsip diusulkan untuk penyusutan."]
    );

    // Audit Activity
    await logActivity({
      userId: req.user.id,
      action: "PROPOSE_DISPOSAL",
      entity: "archive",
      entityId: Number(archiveId),
      metadata: { title: archive.title, documentNumber: archive.document_number }
    });

    // Notify managers
    const managersResult = await query(
      "SELECT id FROM users WHERE role IN ('Admin', 'Inspektur', 'Sekretaris', 'Umpeg') AND is_active = TRUE"
    );
    const managers = managersResult.rows.map((r) => r.id);
    await createNotification({
      broadcast: true,
      title: "Penyusutan Menunggu Persetujuan",
      message: `Penyusutan arsip "${archive.title}" (${archive.document_number}) membutuhkan review persetujuan.`,
      type: "menunggu_persetujuan_penyusutan",
      entityId: archive.id
    });

    res.json({ message: "Arsip berhasil diusulkan untuk penyusutan" });
  })
);

// POST /api/disposals/:id/review (Penyusutan)
router.post(
  "/:id/review",
  authenticate,
  archiveUpload.single("disposal_doc"),
  asyncHandler(async (req, res) => {
    const { notes, isApproved, targetCategory, baNumber } = req.body; // targetCategory: 'Arsip Inaktif', 'Arsip Statis', 'Arsip Musnah'
    const archiveId = req.params.id;
    const file = req.file;

    const isApprovedVal = isApproved === "true" || isApproved === true;

    // Verify role permissions (Admin, Inspektur, Sekretaris, Umpeg)
    if (!GLOBAL_ROLES.includes(req.user.role)) {
      return res.status(403).json({ message: "Hanya Admin, Inspektur, Sekretaris, atau Umpeg yang dapat mereview usulan penyusutan." });
    }

    const archiveCheck = await query(
      "SELECT id, title, document_number, created_by FROM archives WHERE id = $1",
      [archiveId]
    );

    if (archiveCheck.rows.length === 0) {
      return res.status(404).json({ message: "Arsip tidak ditemukan" });
    }

    const archive = archiveCheck.rows[0];

    if (isApprovedVal) {
      let nextStatus = "Inaktif";
      let nextCategory = "Arsip Inaktif";
      let stageText = "Menjadi Arsip Inaktif";

      if (targetCategory === "Arsip Statis") {
        nextStatus = "Statis";
        nextCategory = "Arsip Statis";
        stageText = "Menjadi Arsip Statis";
      } else if (targetCategory === "Arsip Musnah") {
        nextStatus = "Usulan Pemusnahan";
        nextCategory = "Arsip Musnah";
        stageText = "Diusulkan Musnah";
      }

      // Update archives
      await query(
        `UPDATE archives 
         SET lifecycle_status = $1, 
             archive_category = $2, 
             disposal_ba_number = $3,
             disposal_doc_path = COALESCE($4, disposal_doc_path),
             updated_at = NOW() 
         WHERE id = $5`,
        [nextStatus, nextCategory, baNumber || null, file ? file.filename : null, archiveId]
      );

      // Add approval logs
      await query(
        `INSERT INTO archive_lifecycle_logs (archive_id, stage, officer_id, notes, is_approved)
         VALUES ($1, 'Disetujui Penyusutan', $2, $3, TRUE)`,
        [archiveId, req.user.id, `Penyusutan disetujui. No. BA: ${baNumber || "-"}. Tindak lanjut: ${stageText}. Catatan: ${notes || "-"}`]
      );

      await query(
        `INSERT INTO archive_lifecycle_logs (archive_id, stage, officer_id, notes, is_approved)
         VALUES ($1, $2, $3, $4, TRUE)`,
        [archiveId, stageText, req.user.id, `Dipindahkan berdasarkan review penyusutan.`]
      );

      // Audit Activity
      await logActivity({
        userId: req.user.id,
        action: targetCategory === "Arsip Statis" ? "MOVE_STATIC" : "APPROVE_DISPOSAL",
        entity: "archive",
        entityId: Number(archiveId),
        metadata: { title: archive.title, documentNumber: archive.document_number, targetCategory, baNumber }
      });

      // Notify creator
      await createNotification({
        broadcast: true,
        title: "Penyusutan Disetujui",
        message: `Usulan penyusutan arsip "${archive.title}" (${archive.document_number}) telah disetujui menjadi ${nextCategory}.`,
        type: "penyusutan_selesai",
        entityId: archive.id
      });

      if (targetCategory === "Arsip Musnah") {
        // Broadcast notifikasi pemusnahan menunggu verifikasi
        await createNotification({
          broadcast: true,
          title: "Pemusnahan Menunggu Verifikasi",
          message: `Arsip "${archive.title}" (${archive.document_number}) disetujui musnah dan menunggu verifikasi.`,
          type: "menunggu_verifikasi_pemusnahan",
          entityId: archive.id
        });
      }
    } else {
      // Reject proposal
      await query(
        "UPDATE archives SET lifecycle_status = 'Aktif', updated_at = NOW() WHERE id = $1",
        [archiveId]
      );

      await query(
        `INSERT INTO archive_lifecycle_logs (archive_id, stage, officer_id, notes, is_approved)
         VALUES ($1, 'Penyusutan Ditolak', $2, $3, FALSE)`,
        [archiveId, req.user.id, notes || "Usulan penyusutan ditolak."]
      );

      await logActivity({
        userId: req.user.id,
        action: "REJECT_DISPOSAL",
        entity: "archive",
        entityId: Number(archiveId),
        metadata: { title: archive.title, documentNumber: archive.document_number }
      });

      await createNotification({
        broadcast: true,
        title: "Penyusutan Ditolak",
        message: `Usulan penyusutan arsip "${archive.title}" (${archive.document_number}) ditolak oleh ${req.user.name}.`,
        type: "penyusutan_ditolak",
        entityId: archive.id
      });
    }

    res.json({ message: "Review penyusutan berhasil disimpan" });
  })
);

// POST /api/disposals/:id/propose-destruction (Pemusnahan manual)
router.post(
  "/:id/propose-destruction",
  authenticate,
  asyncHandler(async (req, res) => {
    const { notes } = req.body;
    const archiveId = req.params.id;

    const archiveCheck = await query(
      "SELECT id, title, document_number, created_by FROM archives WHERE id = $1 AND lifecycle_status = 'Inaktif'",
      [archiveId]
    );

    if (archiveCheck.rows.length === 0) {
      return res.status(404).json({ message: "Arsip inaktif tidak ditemukan" });
    }

    const archive = archiveCheck.rows[0];

    await query(
      "UPDATE archives SET lifecycle_status = 'Usulan Pemusnahan', updated_at = NOW() WHERE id = $1",
      [archiveId]
    );

    await query(
      `INSERT INTO archive_lifecycle_logs (archive_id, stage, officer_id, notes, is_approved)
       VALUES ($1, 'Usulan Pemusnahan', $2, $3, TRUE)`,
      [archiveId, req.user.id, notes || "Arsip diusulkan untuk pemusnahan."]
    );

    await logActivity({
      userId: req.user.id,
      action: "PROPOSE_DESTRUCTION",
      entity: "archive",
      entityId: Number(archiveId),
      metadata: { title: archive.title, documentNumber: archive.document_number }
    });

    // Notify managers
    const managersResult = await query(
      "SELECT id FROM users WHERE role IN ('Admin', 'Inspektur', 'Sekretaris', 'Umpeg') AND is_active = TRUE"
    );
    const managers = managersResult.rows.map((r) => r.id);
    await createNotification({
      broadcast: true,
      title: "Pemusnahan Menunggu Verifikasi",
      message: `Pemusnahan arsip "${archive.title}" (${archive.document_number}) membutuhkan verifikasi.`,
      type: "menunggu_verifikasi_pemusnahan",
      entityId: archive.id
    });

    res.json({ message: "Arsip berhasil diusulkan untuk pemusnahan" });
  })
);

// POST /api/disposals/:id/verify-destruction (Pemusnahan)
router.post(
  "/:id/verify-destruction",
  authenticate,
  asyncHandler(async (req, res) => {
    const { notes, isApproved } = req.body;
    const archiveId = req.params.id;

    // Verifikasi pemusnahan: Global roles dan pegawai
    if (![...GLOBAL_ROLES, ...UNIT_ROLES].includes(req.user.role)) {
      return res.status(403).json({ message: "Anda tidak memiliki akses untuk memverifikasi usulan pemusnahan." });
    }

    const archiveCheck = await query(
      "SELECT id, title, document_number, created_by FROM archives WHERE id = $1 AND lifecycle_status = 'Usulan Pemusnahan'",
      [archiveId]
    );

    if (archiveCheck.rows.length === 0) {
      return res.status(404).json({ message: "Usulan pemusnahan tidak ditemukan" });
    }

    const archive = archiveCheck.rows[0];

    if (isApproved) {
      await query(
        "UPDATE archives SET lifecycle_status = 'Verifikasi Pemusnahan', updated_at = NOW() WHERE id = $1",
        [archiveId]
      );

      await query(
        `INSERT INTO archive_lifecycle_logs (archive_id, stage, officer_id, notes, is_approved)
         VALUES ($1, 'Verifikasi Pemusnahan', $2, $3, TRUE)`,
        [archiveId, req.user.id, notes || "Verifikasi pemusnahan disetujui."]
      );

      await logActivity({
        userId: req.user.id,
        action: "VERIFY_DESTRUCTION",
        entity: "archive",
        entityId: Number(archiveId),
        metadata: { title: archive.title, documentNumber: archive.document_number }
      });

      // Notify Inspektur (Kepala Inspektorat)
      const inspektursResult = await query(
        "SELECT id FROM users WHERE role = 'Inspektur' AND is_active = TRUE"
      );
      const inspekturs = inspektursResult.rows.map((r) => r.id);
      await createNotification({
        userIds: inspekturs,
        title: "Persetujuan Kepala Inspektorat",
        message: `Pemusnahan arsip "${archive.title}" (${archive.document_number}) membutuhkan persetujuan Kepala Inspektorat.`,
        type: "menunggu_persetujuan_pemusnahan",
        entityId: archive.id
      });
    } else {
      // Reject and return to Inaktif
      await query(
        "UPDATE archives SET lifecycle_status = 'Inaktif', updated_at = NOW() WHERE id = $1",
        [archiveId]
      );

      await query(
        `INSERT INTO archive_lifecycle_logs (archive_id, stage, officer_id, notes, is_approved)
         VALUES ($1, 'Penyusutan Kembali / Pemusnahan Ditolak', $2, $3, FALSE)`,
        [archiveId, req.user.id, notes || "Verifikasi pemusnahan ditolak."]
      );

      await logActivity({
        userId: req.user.id,
        action: "REJECT_DESTRUCTION_VERIFICATION",
        entity: "archive",
        entityId: Number(archiveId),
        metadata: { title: archive.title, documentNumber: archive.document_number }
      });

      await createNotification({
        broadcast: true,
        title: "Usulan Pemusnahan Ditolak",
        message: `Verifikasi pemusnahan arsip "${archive.title}" (${archive.document_number}) ditolak oleh verifikator.`,
        type: "pemusnahan_ditolak",
        entityId: archive.id
      });
    }

    res.json({ message: "Verifikasi pemusnahan berhasil diproses" });
  })
);

// POST /api/disposals/:id/approve-destruction (Pemusnahan)
router.post(
  "/:id/approve-destruction",
  authenticate,
  asyncHandler(async (req, res) => {
    const { notes, isApproved } = req.body;
    const archiveId = req.params.id;

    // Approve pemusnahan: Admin, Inspektur, dan Umpeg
    if (!["Admin", "Inspektur", "Umpeg"].includes(req.user.role)) {
      return res.status(403).json({ message: "Hanya Kepala Inspektorat (Inspektur) atau Admin/Umpeg yang dapat menyetujui pemusnahan." });
    }

    const archiveCheck = await query(
      "SELECT id, title, document_number, created_by FROM archives WHERE id = $1 AND lifecycle_status = 'Verifikasi Pemusnahan'",
      [archiveId]
    );

    if (archiveCheck.rows.length === 0) {
      return res.status(404).json({ message: "Usulan pemusnahan terverifikasi tidak ditemukan" });
    }

    const archive = archiveCheck.rows[0];

    if (isApproved) {
      await query(
        "UPDATE archives SET lifecycle_status = 'Disetujui Pemusnahan', updated_at = NOW() WHERE id = $1",
        [archiveId]
      );

      await query(
        `INSERT INTO archive_lifecycle_logs (archive_id, stage, officer_id, notes, is_approved)
         VALUES ($1, 'Disetujui Pemusnahan', $2, $3, TRUE)`,
        [archiveId, req.user.id, notes || "Persetujuan Kepala Inspektorat diberikan."]
      );

      await logActivity({
        userId: req.user.id,
        action: "APPROVE_DESTRUCTION",
        entity: "archive",
        entityId: Number(archiveId),
        metadata: { title: archive.title, documentNumber: archive.document_number }
      });

      // Notify managers/creator to upload BA
      const managersResult = await query(
        "SELECT id FROM users WHERE role IN ('Admin', 'Sekretaris', 'Sub Bag', 'Staff') AND is_active = TRUE"
      );
      const notified = [...managersResult.rows.map((r) => r.id), archive.created_by];
      await createNotification({
        userIds: notified,
        title: "Pemusnahan Disetujui",
        message: `Persetujuan Kepala Inspektorat selesai. Silakan input Berita Acara untuk arsip "${archive.title}".`,
        type: "pemusnahan_siap_ba",
        entityId: archive.id
      });
    } else {
      // Reject and return to Inaktif
      await query(
        "UPDATE archives SET lifecycle_status = 'Inaktif', updated_at = NOW() WHERE id = $1",
        [archiveId]
      );

      await query(
        `INSERT INTO archive_lifecycle_logs (archive_id, stage, officer_id, notes, is_approved)
         VALUES ($1, 'Pemusnahan Ditolak Kepala Inspektorat', $2, $3, FALSE)`,
        [archiveId, req.user.id, notes || "Persetujuan Kepala Inspektorat ditolak."]
      );

      await logActivity({
        userId: req.user.id,
        action: "REJECT_DESTRUCTION_APPROVAL",
        entity: "archive",
        entityId: Number(archiveId),
        metadata: { title: archive.title, documentNumber: archive.document_number }
      });

      await createNotification({
        broadcast: true,
        title: "Persetujuan Pemusnahan Ditolak",
        message: `Persetujuan pemusnahan arsip "${archive.title}" (${archive.document_number}) ditolak oleh Kepala Inspektorat.`,
        type: "pemusnahan_ditolak",
        entityId: archive.id
      });
    }

    res.json({ message: "Persetujuan pemusnahan berhasil diproses" });
  })
);

// POST /api/disposals/:id/destroy (Pemusnahan execution with multer uploads)
router.post(
  "/:id/destroy",
  authenticate,
  archiveUpload.fields([
    { name: "destruction_doc", maxCount: 1 },
    { name: "destruction_photo", maxCount: 1 }
  ]),
  asyncHandler(async (req, res) => {
    const archiveId = req.params.id;
    const { baNumber, destructionDate, method, officer } = req.body;

    const archiveCheck = await query(
      "SELECT id, title, document_number, created_by FROM archives WHERE id = $1 AND lifecycle_status = 'Disetujui Pemusnahan'",
      [archiveId]
    );

    if (archiveCheck.rows.length === 0) {
      return res.status(404).json({ message: "Arsip yang disetujui musnah tidak ditemukan" });
    }

    const archive = archiveCheck.rows[0];

    const docFile = req.files?.["destruction_doc"]?.[0];
    const photoFile = req.files?.["destruction_photo"]?.[0];

    if (!baNumber || !destructionDate || !method || !officer) {
      return res.status(422).json({ message: "Nomor berita acara, tanggal pemusnahan, metode, dan petugas wajib diisi." });
    }

    const docPath = docFile ? docFile.filename : null;
    const photoPath = photoFile ? photoFile.filename : null;

    // Update archives table to change status to Musnah, category to 'Arsip Musnah', and save destruction info
    await query(
      `UPDATE archives
       SET lifecycle_status = 'Musnah',
           archive_category = 'Arsip Musnah',
           destruction_ba_number = $1,
           destruction_date = $2,
           destruction_method = $3,
           destruction_officer = $4,
           destruction_doc_path = COALESCE($5, destruction_doc_path),
           destruction_photo_path = COALESCE($6, destruction_photo_path),
           updated_at = NOW()
       WHERE id = $7`,
      [baNumber, destructionDate, method, officer, docPath, photoPath, archiveId]
    );

    // Insert log to lifecycle logs
    await query(
      `INSERT INTO archive_lifecycle_logs (archive_id, stage, officer_id, notes, is_approved)
       VALUES ($1, 'Musnah', $2, $3, TRUE)`,
      [
        archiveId,
        req.user.id,
        `Arsip dimusnahkan berdasarkan Berita Acara No. ${baNumber} dengan metode ${method}.`
      ]
    );

    // Log activity
    await logActivity({
      userId: req.user.id,
      action: "DESTROY",
      entity: "archive",
      entityId: Number(archiveId),
      metadata: { title: archive.title, documentNumber: archive.document_number, baNumber }
    });

    // Notify creator & managers
    const managersResult = await query(
      "SELECT id FROM users WHERE role IN ('Admin', 'Inspektur', 'Sekretaris', 'Umpeg') AND is_active = TRUE"
    );
    const recipients = [...managersResult.rows.map((r) => r.id), archive.created_by];
    await createNotification({
      userIds: recipients,
      title: "Pemusnahan Selesai",
      message: `Arsip "${archive.title}" (${archive.document_number}) telah berhasil dimusnahkan.`,
      type: "pemusnahan_selesai",
      entityId: archive.id
    });

    res.json({ message: "Arsip berhasil dimusnahkan" });
  })
);

// GET /api/disposals/:id/download-ba (Pemusnahan)
router.get(
  "/:id/download-ba",
  authenticate,
  asyncHandler(async (req, res) => {
    const archiveId = req.params.id;

    const result = await query(
      "SELECT id, title, document_number, destruction_ba_number, destruction_doc_path FROM archives WHERE id = $1",
      [archiveId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Arsip tidak ditemukan" });
    }

    const archive = result.rows[0];

    if (!archive.destruction_doc_path) {
      return res.status(404).json({ message: "Dokumen Berita Acara tidak tersedia" });
    }

    const absolutePath = resolveUploadPath(archive.destruction_doc_path);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: "File dokumen pendukung tidak ditemukan di server" });
    }

    // Log Activity download BA
    await logActivity({
      userId: req.user.id,
      action: "DOWNLOAD_BA",
      entity: "archive",
      entityId: Number(archiveId),
      metadata: { documentNumber: archive.document_number, baNumber: archive.destruction_ba_number }
    });

    res.download(absolutePath, `BA-Pemusnahan-${archive.destruction_ba_number}.pdf`);
  })
);

// GET /api/disposals/:id/download-disposal-ba (Penyusutan)
router.get(
  "/:id/download-disposal-ba",
  authenticate,
  asyncHandler(async (req, res) => {
    const archiveId = req.params.id;

    const result = await query(
      "SELECT id, title, document_number, disposal_ba_number, disposal_doc_path FROM archives WHERE id = $1",
      [archiveId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Arsip tidak ditemukan" });
    }

    const archive = result.rows[0];

    if (!archive.disposal_doc_path) {
      return res.status(404).json({ message: "Dokumen Berita Acara Penyusutan tidak tersedia" });
    }

    const absolutePath = resolveUploadPath(archive.disposal_doc_path);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: "File dokumen pendukung tidak ditemukan di server" });
    }

    // Log Activity download BA
    await logActivity({
      userId: req.user.id,
      action: "DOWNLOAD_BA",
      entity: "archive",
      entityId: Number(archiveId),
      metadata: { documentNumber: archive.document_number, baNumber: archive.disposal_ba_number }
    });

    res.download(absolutePath, `BA-Penyusutan-${archive.disposal_ba_number}.pdf`);
  })
);

export default router;
