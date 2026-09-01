import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getClient, query } from "../config/db.js";
import { authenticate, authorize, hasRecentPasskey, requireRecentPasskeyFor } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler, cleanText, createHttpError, pagination } from "../utils/http.js";
import { appendAuditLog } from "../services/audit.js";
import { env } from "../config/env.js";
import { securePasswordSchema } from "../services/passwordPolicy.js";
import { recordSecurityEvent } from "../services/securityEvents.js";
import { assertPasswordNotReused, rememberPreviousPassword } from "../services/passwordHistory.js";
import { revokeUserSessions } from "../services/session.js";
import { consumeCriticalApproval, requireCriticalApproval } from "../services/criticalApprovals.js";

const router = Router();

const roleSchema = z.enum([
  "Admin",
  "Inspektur",
  "Sekretaris",
  "Umpeg",
  "Sub Bag Perencanaan",
  "Sub Bag Keuangan",
  "Irban Wilayah I",
  "Irban Wilayah II",
  "Irban Wilayah III",
  "Irban Wilayah IV",
  "Irban Wilayah V"
]);

const optionalUnitId = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().int().positive().optional()
);

const createSchema = z.object({
  name: z.string().trim().min(3).max(120),
  username: z.string().trim().min(3).max(60),
  email: z.string().trim().email().max(160),
  password: securePasswordSchema,
  role: roleSchema,
  unitId: optionalUnitId,
  isActive: z.boolean().optional().default(true)
});

const updateSchema = z.object({
  name: z.string().trim().min(3).max(120).optional(),
  username: z.string().trim().min(3).max(60).optional(),
  email: z.string().trim().email().max(160).optional(),
  role: roleSchema.optional(),
  unitId: optionalUnitId,
  isActive: z.boolean().optional()
});

const resetPasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: securePasswordSchema
});

const resetMfaSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  reason: z.string().trim().min(10).max(500)
});

const unlockAccountSchema = z.object({
  reason: z.string().trim().min(10).max(500)
});

const PRIVILEGED_ROLES = new Set(["Admin", "Inspektur", "Sekretaris", "Umpeg"]);

function ensureUserManagementScope(actor, existingUser, requestedRole) {
  if (actor.role === "Admin") return;

  if (PRIVILEGED_ROLES.has(existingUser?.role) || PRIVILEGED_ROLES.has(requestedRole)) {
    throw createHttpError(403, "Hanya Admin yang dapat mengelola akun dengan akses global");
  }
}

function enforcePrivilegedStepUp(req, ...roles) {
  if (roles.some((role) => PRIVILEGED_ROLES.has(role)) &&
      !hasRecentPasskey(req.user, Math.floor(Date.now() / 1000), "privileged-user-management")) {
    throw createHttpError(
      403,
      "Konfirmasi passkey diperlukan untuk mengelola akun dengan akses istimewa",
      {
        code: "PASSKEY_STEP_UP_REQUIRED",
        action: "privileged-user-management",
        maxAgeMinutes: Math.ceil(env.privilegedReauthMaxAgeSeconds / 60)
      }
    );
  }
}

function userSelectSql() {
  return `
    SELECT u.id, u.name, u.username, u.email, u.role, u.unit_id, u.is_active,
           u.mfa_enabled, u.mfa_enabled_at, u.must_change_password,
           u.failed_login_count, u.login_locked_until,
           EXISTS (SELECT 1 FROM passkey_credentials pc WHERE pc.user_id = u.id) AS passkey_enabled,
           u.created_at, u.updated_at, ou.name AS unit_name
    FROM users u
    LEFT JOIN organization_units ou ON ou.id = u.unit_id
  `;
}

router.use(authenticate, authorize("Admin", "Inspektur", "Sekretaris", "Umpeg"));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = pagination(req.query);
    const where = [];
    const values = [];
    let index = 1;

    const search = cleanText(req.query.search);
    if (search) {
      values.push(`%${search}%`);
      where.push(`(u.name ILIKE $${index} OR u.email ILIKE $${index} OR u.username ILIKE $${index})`);
      index += 1;
    }

    const role = cleanText(req.query.role);
    if (role) {
      values.push(role);
      where.push(`u.role = $${index}`);
      index += 1;
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const count = await query(`SELECT COUNT(*)::int AS total FROM users u ${whereSql}`, values);
    const data = await query(
      `${userSelectSql()}
       ${whereSql}
       ORDER BY u.created_at DESC
       LIMIT $${index} OFFSET $${index + 1}`,
      [...values, limit, offset]
    );

    res.json({
      data: data.rows,
      meta: { page, limit, total: count.rows[0].total }
    });
  })
);

router.post(
  "/",
  validateBody(createSchema),
  asyncHandler(async (req, res) => {
    ensureUserManagementScope(req.user, null, req.body.role);
    enforcePrivilegedStepUp(req, req.body.role);
    let approval = null;
    if (PRIVILEGED_ROLES.has(req.body.role)) {
      approval = await requireCriticalApproval({
        action: "PRIVILEGED_USER_CREATE",
        resourceKey: `new-user:${req.body.email.toLowerCase()}`,
        payload: req.body,
        requester: req.user,
        reason: `Membuat akun istimewa ${req.body.email} dengan role ${req.body.role}`,
        req
      });
    }
    const passwordHash = await bcrypt.hash(req.body.password, env.bcryptRounds);
    const client = await getClient();

    try {
      await client.query("BEGIN");
      if (approval) {
        await consumeCriticalApproval(client, approval, { requesterId: req.user.id, requestId: req.requestId });
      }
      const result = await client.query(
        `INSERT INTO users (name, username, email, password_hash, role, unit_id, is_active, must_change_password)
         VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
         RETURNING id, name, username, email, role, unit_id, is_active, created_at, updated_at`,
        [
          req.body.name,
          req.body.username,
          req.body.email,
          passwordHash,
          req.body.role,
          req.body.unitId || null,
          req.body.isActive
        ]
      );

      await appendAuditLog(client, {
        userId: req.user.id,
        action: "CREATE",
        entity: "user",
        entityId: result.rows[0].id,
        metadata: { email: req.body.email, role: req.body.role, approvalId: approval?.id || null }
      });
      await client.query("COMMIT");
      return res.status(201).json({ data: result.rows[0] });
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23505") throw createHttpError(409, "Username atau email sudah digunakan");
      throw error;
    } finally {
      client.release();
    }
  })
);

router.put(
  "/:id",
  validateBody(updateSchema),
  asyncHandler(async (req, res) => {
    const client = await getClient();
    try {
      await client.query("BEGIN");
      const existingResult = await client.query("SELECT * FROM users WHERE id = $1 FOR NO KEY UPDATE", [req.params.id]);
      const existing = existingResult.rows[0];
      if (!existing) throw createHttpError(404, "User tidak ditemukan");
      ensureUserManagementScope(req.user, existing, req.body.role);
      const changesSecurityScope = req.body.role !== undefined || req.body.unitId !== undefined || req.body.isActive !== undefined;
      if (changesSecurityScope) enforcePrivilegedStepUp(req, existing.role, req.body.role);
      let approval = null;
      if (changesSecurityScope && [existing.role, req.body.role].some((role) => PRIVILEGED_ROLES.has(role))) {
        approval = await requireCriticalApproval({
          action: "PRIVILEGED_USER_UPDATE",
          resourceKey: `user:${existing.id}`,
          payload: {
            targetUserId: existing.id,
            role: req.body.role ?? existing.role,
            unitId: req.body.unitId ?? existing.unit_id,
            isActive: req.body.isActive ?? existing.is_active
          },
          requester: req.user,
          reason: `Mengubah cakupan keamanan akun ${existing.email}`,
          req
        });
        await consumeCriticalApproval(client, approval, { requesterId: req.user.id, requestId: req.requestId });
      }
      const revokesSessions = Boolean(
        req.body.role !== undefined || req.body.unitId !== undefined || req.body.isActive !== undefined
      );

      const result = await client.query(
        `UPDATE users
         SET name = COALESCE($1, name),
             username = COALESCE($2, username),
             email = COALESCE($3, email),
             role = COALESCE($4, role),
             unit_id = COALESCE($5, unit_id),
             is_active = COALESCE($6, is_active),
             token_version = token_version + CASE WHEN $7 THEN 1 ELSE 0 END,
             updated_at = NOW()
         WHERE id = $8
         RETURNING id, name, username, email, role, unit_id, is_active, created_at, updated_at`,
        [
          req.body.name || null,
          req.body.username || null,
          req.body.email || null,
          req.body.role || null,
          req.body.unitId || null,
          req.body.isActive,
          revokesSessions,
          req.params.id
        ]
      );
      if (revokesSessions) await revokeUserSessions(client, existing.id, "account_security_changed");
      await appendAuditLog(client, {
        userId: req.user.id,
        action: "UPDATE",
        entity: "user",
        entityId: Number(req.params.id),
        metadata: { approvalId: approval?.id || null }
      });
      await client.query("COMMIT");
      return res.json({ data: result.rows[0] });
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23505") throw createHttpError(409, "Username atau email sudah digunakan");
      throw error;
    } finally {
      client.release();
    }
  })
);

router.post(
  "/:id/reset-password",
  validateBody(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    const client = await getClient();
    try {
      await client.query("BEGIN");
      const targetResult = await client.query(
        "SELECT id, name, role, password_hash FROM users WHERE id = $1 FOR UPDATE",
        [req.params.id]
      );
      const target = targetResult.rows[0];
      if (!target) throw createHttpError(404, "User tidak ditemukan");
      if (Number(req.params.id) === req.user.id) {
        throw createHttpError(422, "Gunakan menu Pengaturan Akun untuk mengubah password sendiri");
      }
      ensureUserManagementScope(req.user, target);
      enforcePrivilegedStepUp(req, target.role);
      const actorResult = await client.query(
        "SELECT password_hash FROM users WHERE id = $1",
        [req.user.id]
      );
      if (!actorResult.rows[0] || !(await bcrypt.compare(req.body.currentPassword, actorResult.rows[0].password_hash))) {
        await recordSecurityEvent({
          type: "ADMIN_PASSWORD_RESET_AUTH_FAILED",
          severity: "high",
          req,
          userId: req.user.id,
          metadata: { targetUserId: target.id }
        });
        throw createHttpError(422, "Password Anda saat ini tidak sesuai");
      }
      let approval = null;
      if (PRIVILEGED_ROLES.has(target.role)) {
        approval = await requireCriticalApproval({
          action: "PRIVILEGED_USER_PASSWORD_RESET",
          resourceKey: `user:${target.id}`,
          payload: { targetUserId: target.id, newPassword: req.body.newPassword },
          requester: req.user,
          reason: `Reset password akun istimewa ${target.name}`,
          req
        });
        await consumeCriticalApproval(client, approval, { requesterId: req.user.id, requestId: req.requestId });
      }
      await assertPasswordNotReused(client, target.id, req.body.newPassword, target.password_hash);
      const passwordHash = await bcrypt.hash(req.body.newPassword, env.bcryptRounds);
      await rememberPreviousPassword(client, target.id, target.password_hash);
      await client.query(
        `UPDATE users SET password_hash = $1, must_change_password = TRUE,
                          token_version = token_version + 1, updated_at = NOW()
         WHERE id = $2`,
        [passwordHash, target.id]
      );
      await revokeUserSessions(client, target.id, "admin_password_reset");
      await appendAuditLog(client, {
        userId: req.user.id,
        action: "RESET_PASSWORD",
        entity: "user",
        entityId: target.id,
        metadata: { targetName: target.name, approvalId: approval?.id || null }
      });
      await client.query("COMMIT");
      return res.json({ message: `Password untuk ${target.name} berhasil direset` });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  })
);

router.post(
  "/:id/unlock",
  authorize("Admin"),
  requireRecentPasskeyFor("unlock-account"),
  validateBody(unlockAccountSchema),
  asyncHandler(async (req, res) => {
    const client = await getClient();
    try {
      await client.query("BEGIN");
      const target = await client.query(
        `UPDATE users SET failed_login_count = 0, last_failed_login_at = NULL,
                          login_locked_until = NULL, updated_at = NOW()
         WHERE id = $1 RETURNING id, name`,
        [req.params.id]
      );
      if (!target.rows[0]) throw createHttpError(404, "User tidak ditemukan");
      await appendAuditLog(client, {
        userId: req.user.id,
        action: "ACCOUNT_UNLOCKED",
        entity: "user",
        entityId: target.rows[0].id,
        metadata: { reason: req.body.reason }
      });
      await client.query("COMMIT");
      await recordSecurityEvent({
        type: "ACCOUNT_UNLOCKED_BY_ADMIN",
        severity: "high",
        req,
        userId: req.user.id,
        metadata: { targetUserId: target.rows[0].id, reason: req.body.reason }
      });
      return res.json({ message: `Kunci login ${target.rows[0].name} berhasil dibuka.` });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  })
);

router.post(
  "/:id/reset-mfa",
  authorize("Admin"),
  requireRecentPasskeyFor("reset-mfa"),
  validateBody(resetMfaSchema),
  asyncHandler(async (req, res) => {
    if (Number(req.params.id) === req.user.id) {
      throw createHttpError(422, "Reset MFA akun sendiri harus ditangani Admin lain");
    }

    const client = await getClient();
    try {
      await client.query("BEGIN");
      const actorResult = await client.query(
        "SELECT password_hash FROM users WHERE id = $1",
        [req.user.id]
      );
      if (!actorResult.rows[0] || !(await bcrypt.compare(req.body.currentPassword, actorResult.rows[0].password_hash))) {
        throw createHttpError(422, "Password Admin tidak sesuai");
      }

      const targetResult = await client.query(
        "SELECT id, name, role, mfa_enabled FROM users WHERE id = $1 FOR UPDATE",
        [req.params.id]
      );
      const target = targetResult.rows[0];
      if (!target) throw createHttpError(404, "User tidak ditemukan");
      if (!target.mfa_enabled) throw createHttpError(409, "MFA user tersebut belum aktif");

      const approval = await requireCriticalApproval({
        action: "RESET_MFA",
        resourceKey: `user:${target.id}`,
        payload: { targetUserId: target.id },
        requester: req.user,
        reason: req.body.reason,
        req
      });
      await consumeCriticalApproval(client, approval, { requesterId: req.user.id, requestId: req.requestId });

      await client.query(
        `UPDATE users
         SET mfa_enabled = FALSE, mfa_secret_encrypted = NULL,
             mfa_pending_secret_encrypted = NULL, mfa_pending_expires_at = NULL,
             mfa_last_used_step = NULL, mfa_enabled_at = NULL,
             token_version = token_version + 1, updated_at = NOW()
         WHERE id = $1`,
        [target.id]
      );
      await client.query("DELETE FROM mfa_recovery_codes WHERE user_id = $1", [target.id]);
      await client.query("DELETE FROM mfa_challenges WHERE user_id = $1", [target.id]);
      await client.query("DELETE FROM passkey_credentials WHERE user_id = $1", [target.id]);
      await client.query("DELETE FROM webauthn_challenges WHERE user_id = $1", [target.id]);
      await revokeUserSessions(client, target.id, "admin_mfa_reset");
      await appendAuditLog(client, {
        userId: req.user.id,
        action: "ADMIN_RESET_MFA",
        entity: "user",
        entityId: target.id,
        metadata: { targetName: target.name, reason: req.body.reason, approvalId: approval.id }
      });
      await client.query(
        `INSERT INTO notifications (user_id, title, message, type, entity_id)
         VALUES ($1, $2, $3, 'mfa_reset', $1)`,
        [target.id, "MFA Direset Admin", "MFA akun Anda telah direset. Aktifkan kembali MFA sebelum menggunakan SIPADI."]
      );
      await client.query("COMMIT");

      await recordSecurityEvent({
        type: "ADMIN_MFA_RESET",
        severity: "high",
        req,
        userId: req.user.id,
        metadata: { targetUserId: target.id, reason: req.body.reason }
      });
      return res.json({ message: `MFA untuk ${target.name} berhasil direset dan seluruh sesi dicabut.` });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    if (Number(req.params.id) === req.user.id) {
      throw createHttpError(400, "Akun yang sedang login tidak dapat dinonaktifkan dari sesi sendiri");
    }

    const existing = await query("SELECT role FROM users WHERE id = $1", [req.params.id]);
    if (!existing.rows[0]) throw createHttpError(404, "User tidak ditemukan");
    ensureUserManagementScope(req.user, existing.rows[0]);
    enforcePrivilegedStepUp(req, existing.rows[0].role);
    let approval = null;
    if (PRIVILEGED_ROLES.has(existing.rows[0].role)) {
      approval = await requireCriticalApproval({
        action: "PRIVILEGED_USER_DEACTIVATE",
        resourceKey: `user:${req.params.id}`,
        payload: { targetUserId: Number(req.params.id), deactivate: true },
        requester: req.user,
        reason: `Menonaktifkan akun istimewa user #${req.params.id}`,
        req
      });
    }

    const client = await getClient();
    try {
      await client.query("BEGIN");
      if (approval) {
        await consumeCriticalApproval(client, approval, { requesterId: req.user.id, requestId: req.requestId });
      }
      const result = await client.query(
        `UPDATE users SET is_active = FALSE, token_version = token_version + 1, updated_at = NOW()
         WHERE id = $1 RETURNING id`,
        [req.params.id]
      );
      if (!result.rows[0]) throw createHttpError(404, "User tidak ditemukan");
      await client.query(
        "UPDATE user_sessions SET revoked_at = NOW(), revoked_reason = 'account_deactivated' WHERE user_id = $1 AND revoked_at IS NULL",
        [req.params.id]
      );
      await appendAuditLog(client, {
        userId: req.user.id,
        action: "DELETE",
        entity: "user",
        entityId: Number(req.params.id),
        metadata: { approvalId: approval?.id || null }
      });
      await client.query("COMMIT");
      return res.status(204).send();
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  })
);

export default router;
