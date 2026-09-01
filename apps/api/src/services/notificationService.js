import { query } from "../config/db.js";
import { pushToUser, broadcastToAll } from "./sseManager.js";

// Helper: ambil semua user aktif di sistem
async function getAllActiveUserIds() {
  const result = await query(`SELECT id FROM users WHERE is_active = TRUE`);
  return result.rows.map((row) => row.id);
}

// Helper lama — tetap ada untuk kompatibilitas (tidak dipakai lagi untuk retensi)
export async function getManagerialUserIds() {
  const result = await query(
    `SELECT id FROM users WHERE role IN ('Admin', 'Inspektur', 'Sekretaris', 'Umpeg') AND is_active = TRUE`
  );
  return result.rows.map((row) => row.id);
}

/**
 * Buat notifikasi dan push real-time via SSE.
 * @param {object} opts
 * @param {number[]} [opts.userIds]   - kirim ke user tertentu
 * @param {boolean} [opts.broadcast]  - jika true, kirim ke semua user aktif
 * @param {string}  opts.title
 * @param {string}  opts.message
 * @param {string}  opts.type
 * @param {number}  [opts.entityId]
 * @param {boolean} [opts.dedupe]
 */
export async function createNotification({ userIds, broadcast = false, title, message, type, entityId, dedupe = false }) {
  // Tentukan penerima
  let recipients = broadcast
    ? await getAllActiveUserIds()
    : [...new Set([].concat(userIds).filter(Boolean))];

  for (const userId of recipients) {
    if (dedupe) {
      const existing = await query(
        `SELECT id FROM notifications WHERE user_id = $1 AND type = $2 AND entity_id = $3`,
        [userId, type, entityId ?? null]
      );

      if (existing.rows.length > 0) {
        continue;
      }
    }

    const result = await query(
      `INSERT INTO notifications (user_id, title, message, type, entity_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, title, message, type, entityId ?? null]
    );
    pushToUser(userId, result.rows[0]);
  }

  // Jika broadcast dan tidak ada entity_id (event baru unik per waktu), push langsung ke semua
  if (broadcast && !entityId) {
    broadcastToAll({ title, message, type, created_at: new Date().toISOString() });
  }
}

export async function checkAndGenerateNotifications() {
  // Broadcast ke semua user aktif
  const allUserIds = await getAllActiveUserIds();

  // 1. Retensi aktif akan habis dalam 30 hari
  const expiringActiveResult = await query(`
    SELECT id, title, document_number, created_by,
           (archive_date + (active_retention * INTERVAL '1 year'))::date AS active_end_date
    FROM archives
    WHERE lifecycle_status = 'Aktif'
      AND status = 'Diarsipkan'
      AND CURRENT_DATE >= (archive_date + (active_retention * INTERVAL '1 year') - INTERVAL '30 days')
      AND CURRENT_DATE < (archive_date + (active_retention * INTERVAL '1 year'))
  `);

  for (const archive of expiringActiveResult.rows) {
    const title = "Retensi Aktif Segera Habis";
    const message = `Retensi aktif arsip "${archive.title}" (${archive.document_number}) akan habis pada tanggal ${archive.active_end_date}.`;
    await createNotification({
      userIds: allUserIds,
      title,
      message,
      type: "retensi_habis",
      entityId: archive.id,
      dedupe: true
    });
  }

  // 2. Arsip siap disusutkan (melewati retensi aktif)
  const readyForDisposalResult = await query(`
    SELECT id, title, document_number, created_by
    FROM archives
    WHERE lifecycle_status = 'Aktif'
      AND status = 'Diarsipkan'
      AND CURRENT_DATE >= (archive_date + (active_retention * INTERVAL '1 year'))
  `);

  for (const archive of readyForDisposalResult.rows) {
    const title = "Arsip Siap Disusutkan";
    const message = `Arsip "${archive.title}" (${archive.document_number}) telah melewati masa retensi aktif dan siap disusutkan.`;
    await createNotification({
      userIds: allUserIds,
      title,
      message,
      type: "siap_susut",
      entityId: archive.id,
      dedupe: true
    });
  }

  // 3. Arsip siap dimusnahkan (melewati retensi inaktif)
  const readyForDestructionResult = await query(`
    SELECT id, title, document_number, created_by
    FROM archives
    WHERE lifecycle_status = 'Inaktif'
      AND archive_category = 'Arsip Inaktif'
      AND CURRENT_DATE >= (archive_date + ((active_retention + inactive_retention) * INTERVAL '1 year'))
  `);

  for (const archive of readyForDestructionResult.rows) {
    const title = "Arsip Siap Dimusnahkan";
    const message = `Arsip "${archive.title}" (${archive.document_number}) telah melewati masa retensi inaktif dan siap dimusnahkan.`;
    await createNotification({
      userIds: allUserIds,
      title,
      message,
      type: "siap_musnah",
      entityId: archive.id,
      dedupe: true
    });
  }

  // 4. Retensi inaktif akan habis dalam 30 hari
  const expiringInactiveResult = await query(`
    SELECT id, title, document_number, created_by,
           (archive_date + ((active_retention + inactive_retention) * INTERVAL '1 year'))::date AS inactive_end_date
    FROM archives
    WHERE lifecycle_status = 'Inaktif'
      AND archive_category = 'Arsip Inaktif'
      AND CURRENT_DATE >= (archive_date + ((active_retention + inactive_retention) * INTERVAL '1 year') - INTERVAL '30 days')
      AND CURRENT_DATE < (archive_date + ((active_retention + inactive_retention) * INTERVAL '1 year'))
  `);

  for (const archive of expiringInactiveResult.rows) {
    const title = "Retensi Inaktif Segera Habis";
    const message = `Retensi inaktif arsip "${archive.title}" (${archive.document_number}) akan habis pada tanggal ${archive.inactive_end_date}.`;
    await createNotification({
      userIds: allUserIds,
      title,
      message,
      type: "retensi_inaktif_habis",
      entityId: archive.id,
      dedupe: true
    });
  }

  // 5. Reminder peminjaman H-3
  const loanDueH3Result = await query(`
    SELECT l.id, l.archive_id, l.user_id, l.loan_deadline,
           a.title AS archive_title, a.document_number,
           requester.name AS requester_name
    FROM archive_loans l
    JOIN archives a ON a.id = l.archive_id
    JOIN users requester ON requester.id = l.user_id
    WHERE l.status = 'Disetujui'
      AND l.loan_deadline = CURRENT_DATE + INTERVAL '3 days'
  `);

  // 6. Reminder peminjaman H-1
  const loanDueH1Result = await query(`
    SELECT l.id, l.archive_id, l.user_id, l.loan_deadline,
           a.title AS archive_title, a.document_number,
           requester.name AS requester_name
    FROM archive_loans l
    JOIN archives a ON a.id = l.archive_id
    JOIN users requester ON requester.id = l.user_id
    WHERE l.status = 'Disetujui'
      AND l.loan_deadline = CURRENT_DATE + INTERVAL '1 day'
  `);

  // 7. Reminder peminjaman lewat jatuh tempo
  const overdueLoanResult = await query(`
    SELECT l.id, l.archive_id, l.user_id, l.loan_deadline,
           a.title AS archive_title, a.document_number,
           requester.name AS requester_name
    FROM archive_loans l
    JOIN archives a ON a.id = l.archive_id
    JOIN users requester ON requester.id = l.user_id
    WHERE l.status = 'Disetujui'
      AND l.loan_deadline < CURRENT_DATE
  `);

  const managerIds = await getManagerialUserIds();

  for (const loan of loanDueH3Result.rows) {
    await createNotification({
      userIds: [loan.user_id, ...managerIds],
      title: "Reminder Peminjaman H-3",
      message: `Peminjaman arsip "${loan.archive_title}" (${loan.document_number}) milik ${loan.requester_name} akan jatuh tempo pada ${loan.loan_deadline}.`,
      type: "loan_due_h3",
      entityId: loan.id,
      dedupe: true
    });
  }

  for (const loan of loanDueH1Result.rows) {
    await createNotification({
      userIds: [loan.user_id, ...managerIds],
      title: "Reminder Peminjaman H-1",
      message: `Peminjaman arsip "${loan.archive_title}" (${loan.document_number}) milik ${loan.requester_name} akan jatuh tempo besok, ${loan.loan_deadline}.`,
      type: "loan_due_h1",
      entityId: loan.id,
      dedupe: true
    });
  }

  for (const loan of overdueLoanResult.rows) {
    await createNotification({
      userIds: [loan.user_id, ...managerIds],
      title: "Peminjaman Lewat Jatuh Tempo",
      message: `Peminjaman arsip "${loan.archive_title}" (${loan.document_number}) milik ${loan.requester_name} telah melewati batas pengembalian ${loan.loan_deadline}.`,
      type: "loan_overdue",
      entityId: loan.id,
      dedupe: true
    });
  }
}
