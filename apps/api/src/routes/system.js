import { Router } from "express";
import bcrypt from "bcryptjs";
import { getClient, query } from "../config/db.js";
import { authenticate, authorize, requireRecentPasskeyFor } from "../middleware/auth.js";
import { backupUpload } from "../middleware/upload.js";
import { exportBackup, restoreBackup, summarizeRestoreResult } from "../services/systemBackup.js";
import { decryptBackupPayload, encryptBackupPayload } from "../services/backupEncryption.js";
import { appendAuditLog } from "../services/audit.js";
import { asyncHandler, createHttpError } from "../utils/http.js";
import { registerSecurityStrike } from "../middleware/security.js";
import { consumeCriticalApproval, requireCriticalApproval } from "../services/criticalApprovals.js";

const router = Router();

router.get(
  "/backup/export",
  authenticate,
  authorize("Admin"),
  requireRecentPasskeyFor("backup-export"),
  asyncHandler(async (req, res) => {
    const approval = await requireCriticalApproval({
      action: "BACKUP_EXPORT",
      resourceKey: "system-backup",
      payload: { format: "sipadi-encrypted" },
      requester: req.user,
      reason: String(req.query.approvalReason || "Ekspor backup terenkripsi SIPADI").slice(0, 500),
      req
    });
    const client = await getClient();

    try {
      await client.query("BEGIN");
      await consumeCriticalApproval(client, approval, { requesterId: req.user.id, requestId: req.requestId });
      const backup = await exportBackup(client);
      let encryptedBackup;
      try {
        encryptedBackup = encryptBackupPayload(backup);
      } catch (error) {
        if (error.code === "INVALID_ENCRYPTION_KEY") {
          throw createHttpError(503, "Kunci enkripsi backup belum dikonfigurasi");
        }
        throw error;
      }

      await appendAuditLog(client, {
        userId: req.user.id,
        action: "BACKUP_EXPORT",
        entity: "system",
        metadata: { tables: backup.tables.length, encrypted: true, approvalId: approval.id }
      });
      await client.query("COMMIT");

      const filename = `sipadi-backup-${new Date().toISOString().slice(0, 10)}.sipadi`;
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(encryptedBackup);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  })
);

router.post(
  "/backup/restore",
  authenticate,
  authorize("Admin"),
  requireRecentPasskeyFor("backup-restore"),
  backupUpload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw createHttpError(422, "File backup .sipadi wajib diunggah");
    }

    const actor = await query("SELECT password_hash FROM users WHERE id = $1", [req.user.id]);
    const passwordValid = actor.rows[0] && await bcrypt.compare(String(req.body.currentPassword || ""), actor.rows[0].password_hash);
    if (!passwordValid || req.body.confirmation !== "RESTORE SIPADI") {
      registerSecurityStrike(req, { type: "BACKUP_RESTORE_AUTH_FAILED", severity: "high" });
      throw createHttpError(422, "Password Admin atau frasa konfirmasi restore tidak sesuai");
    }

    let decoded;
    try {
      decoded = decryptBackupPayload(req.file.buffer);
    } catch (error) {
      if (["INVALID_ENCRYPTION_KEY", "ENCRYPTION_KEY_NOT_FOUND"].includes(error.code)) {
        throw createHttpError(503, "Kunci untuk backup ini tidak tersedia");
      }
      throw createHttpError(422, error.message || "File backup tidak dapat didekripsi");
    }

    const approval = await requireCriticalApproval({
      action: "BACKUP_RESTORE",
      resourceKey: "system-backup",
      payload: req.file.buffer,
      requester: req.user,
      reason: String(req.body.approvalReason || "Restore backup terenkripsi SIPADI").slice(0, 500),
      req
    });
    const client = await getClient();

    try {
      await client.query("BEGIN");
      await consumeCriticalApproval(client, approval, { requesterId: req.user.id, requestId: req.requestId });

      const restored = await restoreBackup(client, decoded.payload);
      await appendAuditLog(client, {
        userId: req.user.id,
        action: "BACKUP_RESTORE",
        entity: "system",
        metadata: {
          actorUserId: req.user.id,
          filename: req.file.originalname,
          encrypted: decoded.encrypted,
          keyId: decoded.keyId,
          approvalId: approval.id,
          restoredRows: summarizeRestoreResult(restored)
        }
      });
      await client.query("COMMIT");

      res.json({
        message: "Restore data SIPADI berhasil dijalankan.",
        data: {
          restored,
          totalRows: summarizeRestoreResult(restored)
        }
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw createHttpError(error.status || 422, error.message || "Restore data gagal");
    } finally {
      client.release();
    }
  })
);

export default router;
