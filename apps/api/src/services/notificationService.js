import { query } from "../config/db.js";

// Helper to get all Admin, Inspektur, and Sekretaris users who should receive lifecycle notifications
async function getManagerialUserIds() {
  const result = await query(
    `SELECT id FROM users WHERE role IN ('Admin', 'Inspektur', 'Sekretaris') AND is_active = TRUE`
  );
  return result.rows.map((row) => row.id);
}

export async function createNotification({ userIds, title, message, type, entityId }) {
  // Ensure userIds is an array and unique
  const uniqueUserIds = [...new Set([].concat(userIds).filter(Boolean))];

  for (const userId of uniqueUserIds) {
    // Check if notification already exists to prevent duplicate spam
    const existing = await query(
      `SELECT id FROM notifications 
       WHERE user_id = $1 AND type = $2 AND entity_id = $3`,
      [userId, type, entityId]
    );

    if (existing.rows.length === 0) {
      await query(
        `INSERT INTO notifications (user_id, title, message, type, entity_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, title, message, type, entityId]
      );
    }
  }
}

export async function checkAndGenerateNotifications() {
  const managers = await getManagerialUserIds();

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
    const recipients = [...managers, archive.created_by];
    await createNotification({
      userIds: recipients,
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
    const recipients = [...managers, archive.created_by];
    await createNotification({
      userIds: recipients,
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
    const recipients = [...managers, archive.created_by];
    await createNotification({
      userIds: recipients,
      title,
      message,
      type: "siap_musnah",
      entityId: archive.id
    });
  }
}
