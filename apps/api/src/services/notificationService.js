import { query } from "../config/db.js";
import { pushToUser, broadcastToAll } from "./sseManager.js";

// Helper: ambil semua user aktif di sistem
async function getAllActiveUserIds() {
  const result = await query(`SELECT id FROM users WHERE is_active = TRUE`);
  return result.rows.map((row) => row.id);
}

// Helper lama — tetap ada untuk kompatibilitas (tidak dipakai lagi untuk retensi)
async function getManagerialUserIds() {
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
 */
export async function createNotification({ userIds, broadcast = false, title, message, type, entityId }) {
  // Tentukan penerima
  let recipients = broadcast
    ? await getAllActiveUserIds()
    : [...new Set([].concat(userIds).filter(Boolean))];

  for (const userId of recipients) {
    // Cek duplikat (untuk notifikasi lifecycle otomatis)
    const existing = await query(
      `SELECT id FROM notifications WHERE user_id = $1 AND type = $2 AND entity_id = $3`,
      [userId, type, entityId ?? null]
    );

    if (existing.rows.length === 0) {
      const result = await query(
        `INSERT INTO notifications (user_id, title, message, type, entity_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, title, message, type, entityId ?? null]
      );
      // Push real-time ke user yang sedang online
      pushToUser(userId, result.rows[0]);
    }
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
      entityId: archive.id
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
      entityId: archive.id
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
      entityId: archive.id
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
      entityId: archive.id
    });
  }
}
