import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { env } from "../config/env.js";
import { getClient, query } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { asyncHandler, createHttpError } from "../utils/http.js";
import { appendAuditLog, logActivity } from "../services/audit.js";
import { loginRateLimit, mfaRateLimit, registerSecurityStrike } from "../middleware/security.js";
import { securePasswordSchema } from "../services/passwordPolicy.js";
import { clearSessionCookie, issueSessionCookie, revokeSessionFromRequest, revokeUserSessions } from "../services/session.js";
import { accountIsLocked, recordAccountLoginFailure, resetAccountLoginFailures } from "../services/loginProtection.js";
import { assertPasswordNotReused, rememberPreviousPassword } from "../services/passwordHistory.js";
import {
  consumeMfaChallenge,
  createMfaChallenge,
  createMfaEnrollment,
  decryptMfaSecret,
  encryptMfaSecret,
  isMfaRequiredRole,
  replaceRecoveryCodes,
  verifyTotp,
  verifyUserSecondFactor
} from "../services/mfa.js";
import {
  createPasskeyAuthentication,
  createPasskeyRegistration,
  createPasskeyStepUp,
  isPasskeyRequiredRole,
  listUserPasskeys,
  PASSKEY_STEP_UP_ACTIONS,
  removeUserPasskey,
  verifyPasskeyAuthentication,
  verifyPasskeyRegistration,
  verifyPasskeyStepUp
} from "../services/passkeys.js";

const router = Router();

const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(160),
  password: z.string().min(1).max(128)
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(3).max(120),
  username: z.string().trim().min(3).max(60),
  email: z.string().trim().email().max(160)
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: securePasswordSchema
});

const mfaVerifySchema = z.object({
  challengeToken: z.string().min(40).max(200),
  code: z.string().trim().min(6).max(30)
});

const mfaSetupSchema = z.object({
  currentPassword: z.string().min(1).max(128)
});

const mfaCodeSchema = z.object({
  code: z.string().trim().min(6).max(30)
});

const mfaSensitiveActionSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  code: z.string().trim().min(6).max(30)
});

const passkeyAuthenticationOptionsSchema = z.object({
  challengeToken: z.string().min(40).max(200)
});

const passkeyAuthenticationVerifySchema = z.object({
  challengeToken: z.string().min(40).max(200),
  ceremonyToken: z.string().min(40).max(200),
  response: z.record(z.unknown())
});

const passkeyRegistrationOptionsSchema = z.object({
  currentPassword: z.string().min(1).max(128)
});

const passkeyRegistrationVerifySchema = z.object({
  ceremonyToken: z.string().min(40).max(200),
  name: z.string().trim().min(3).max(100),
  response: z.record(z.unknown())
});

const passkeyStepUpOptionsSchema = z.object({
  action: z.enum(PASSKEY_STEP_UP_ACTIONS)
});

const passkeyStepUpVerifySchema = z.object({
  action: z.enum(PASSKEY_STEP_UP_ACTIONS),
  ceremonyToken: z.string().min(40).max(200),
  response: z.record(z.unknown())
});

const passkeyRemoveSchema = z.object({
  currentPassword: z.string().min(1).max(128)
});

const DUMMY_PASSWORD_HASH = "$2a$12$65alHoeL12f04VdXlIAflOIDPRAq6uF6yDzvWcJxXT3/HUnqWMtWq";

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    unitId: user.unit_id || user.unitId,
    unitName: user.unit_name || user.unitName,
    isActive: user.is_active,
    mfaEnabled: Boolean(user.mfa_enabled ?? user.mfaEnabled),
    mfaRequired: isMfaRequiredRole(user.role),
    mfaSetupRequired: isMfaRequiredRole(user.role) && !Boolean(user.mfa_enabled ?? user.mfaEnabled),
    passkeyEnabled: Boolean(user.passkey_enabled ?? user.passkeyEnabled),
    passkeyRequired: isPasskeyRequiredRole(user.role),
    passkeySetupRequired: isPasskeyRequiredRole(user.role) && !Boolean(user.passkey_enabled ?? user.passkeyEnabled),
    passwordChangeRequired: Boolean(user.must_change_password ?? user.passwordChangeRequired)
  };
}

router.post(
  "/login",
  loginRateLimit,
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;
    const result = await query(
      `SELECT u.id, u.name, u.username, u.email, u.password_hash, u.role, u.unit_id, u.is_active,
              u.must_change_password, u.failed_login_count, u.login_locked_until,
              u.token_version, u.mfa_enabled,
              EXISTS (SELECT 1 FROM passkey_credentials pc WHERE pc.user_id = u.id) AS passkey_enabled,
              ou.name AS unit_name
       FROM users u
       LEFT JOIN organization_units ou ON ou.id = u.unit_id
       WHERE LOWER(u.email) = LOWER($1) OR LOWER(u.username) = LOWER($1)
       LIMIT 1`,
      [identifier]
    );

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user?.password_hash || DUMMY_PASSWORD_HASH);
    if (!user || !user.is_active || !valid) {
      const failure = user && !accountIsLocked(user) ? await recordAccountLoginFailure(user.id) : null;
      registerSecurityStrike(req, {
        type: "LOGIN_FAILED",
        severity: "medium",
        metadata: {
          accountExists: Boolean(user),
          accountActive: Boolean(user?.is_active),
          accountLocked: accountIsLocked(user) || Boolean(failure?.login_locked_until)
        }
      });
      throw createHttpError(401, "Email/username atau password salah");
    }
    if (accountIsLocked(user)) {
      registerSecurityStrike(req, { type: "ACCOUNT_LOGIN_LOCKED", severity: "high" });
      throw createHttpError(429, "Akun terkunci sementara karena terlalu banyak percobaan login. Coba kembali nanti");
    }
    await resetAccountLoginFailures(user.id);

    if (user.mfa_enabled) {
      const challenge = await createMfaChallenge(user.id);
      await logActivity({
        userId: user.id,
        action: "LOGIN_PASSWORD_ACCEPTED_MFA_PENDING",
        entity: "auth",
        metadata: { expiresAt: challenge.expiresAt }
      });
      return res.json({
        mfaRequired: true,
        passkeyAvailable: Boolean(user.passkey_enabled),
        challengeToken: challenge.token,
        expiresAt: challenge.expiresAt
      });
    }

    await issueSessionCookie(res, { ...user, mfaVerified: false, authenticationMethods: ["pwd"] }, { req });

    await logActivity({
      userId: user.id,
      action: "LOGIN",
      entity: "auth",
      metadata: { identifier }
    });

    return res.json({
      user: publicUser(user)
    });
  })
);

router.post(
  "/mfa/verify",
  mfaRateLimit,
  validateBody(mfaVerifySchema),
  asyncHandler(async (req, res) => {
    const result = await consumeMfaChallenge(req.body.challengeToken, req.body.code);
    if (!result.valid) {
      registerSecurityStrike(req, {
        type: "MFA_VERIFICATION_FAILED",
        severity: "high",
        metadata: { reason: result.reason }
      });
      throw createHttpError(result.reason === "locked" ? 429 : 401, "Kode MFA tidak valid atau challenge sudah berakhir");
    }

    await issueSessionCookie(res, {
      ...result.user,
      mfaVerified: true,
      authenticationMethods: ["pwd", result.method]
    }, { req });
    await logActivity({
      userId: result.user.id,
      action: "LOGIN_MFA_SUCCESS",
      entity: "auth",
      metadata: { method: result.method }
    });
    return res.json({ user: publicUser(result.user) });
  })
);

router.get(
  "/mfa/status",
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await query(
      `SELECT u.mfa_enabled, u.mfa_enabled_at, u.mfa_secret_encrypted IS NOT NULL AS totp_enabled,
              COUNT(DISTINCT rc.id) FILTER (WHERE rc.used_at IS NULL)::int AS recovery_codes_remaining,
              COUNT(DISTINCT pc.id)::int AS passkey_count
       FROM users u
       LEFT JOIN mfa_recovery_codes rc ON rc.user_id = u.id
       LEFT JOIN passkey_credentials pc ON pc.user_id = u.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.user.id]
    );
    const status = result.rows[0];
    return res.json({
      data: {
        enabled: Boolean(status?.mfa_enabled),
        required: isMfaRequiredRole(req.user.role),
        enabledAt: status?.mfa_enabled_at || null,
        recoveryCodesRemaining: status?.recovery_codes_remaining || 0,
        totpEnabled: Boolean(status?.totp_enabled),
        passkeyCount: status?.passkey_count || 0,
        passkeyRequired: isPasskeyRequiredRole(req.user.role)
      }
    });
  })
);

router.post(
  "/mfa/setup",
  authenticate,
  validateBody(mfaSetupSchema),
  asyncHandler(async (req, res) => {
    const result = await query(
      "SELECT id, username, email, password_hash, mfa_enabled FROM users WHERE id = $1",
      [req.user.id]
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(req.body.currentPassword, user.password_hash))) {
      registerSecurityStrike(req, { type: "MFA_SETUP_AUTH_FAILED", severity: "high" });
      throw createHttpError(422, "Password saat ini tidak sesuai");
    }
    const totpExists = await query("SELECT mfa_secret_encrypted IS NOT NULL AS enabled FROM users WHERE id = $1", [user.id]);
    if (totpExists.rows[0]?.enabled) {
      throw createHttpError(409, "Authenticator TOTP sudah aktif pada akun ini");
    }

    const enrollment = await createMfaEnrollment(user);
    const expiresAt = new Date(Date.now() + env.mfaSetupTtlMs);
    await query(
      `UPDATE users
       SET mfa_pending_secret_encrypted = $1,
           mfa_pending_expires_at = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [encryptMfaSecret(enrollment.secret, user.id), expiresAt, user.id]
    );

    await logActivity({ userId: user.id, action: "MFA_SETUP_STARTED", entity: "auth" });
    return res.json({
      data: {
        qrCodeDataUrl: enrollment.qrCodeDataUrl,
        manualKey: enrollment.secret,
        expiresAt
      }
    });
  })
);

router.post(
  "/mfa/enable",
  authenticate,
  mfaRateLimit,
  validateBody(mfaCodeSchema),
  asyncHandler(async (req, res) => {
    const client = await getClient();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `SELECT u.*,
                EXISTS (SELECT 1 FROM passkey_credentials pc WHERE pc.user_id = u.id) AS passkey_enabled,
                ou.name AS unit_name
         FROM users u
         LEFT JOIN organization_units ou ON ou.id = u.unit_id
         WHERE u.id = $1
         FOR UPDATE OF u`,
        [req.user.id]
      );
      const user = result.rows[0];
      if (!user?.mfa_pending_secret_encrypted || !user.mfa_pending_expires_at || new Date(user.mfa_pending_expires_at) <= new Date()) {
        throw createHttpError(422, "Sesi setup MFA sudah berakhir. Mulai setup kembali");
      }

      const secret = decryptMfaSecret(user.mfa_pending_secret_encrypted, user.id);
      const verification = verifyTotp(secret, req.body.code);
      if (!verification.valid) {
        registerSecurityStrike(req, { type: "MFA_ENROLLMENT_FAILED", severity: "high" });
        throw createHttpError(422, "Kode authenticator tidak valid");
      }

      const codes = await replaceRecoveryCodes(client, user.id);
      const updateResult = await client.query(
        `UPDATE users
         SET mfa_enabled = TRUE,
             mfa_secret_encrypted = mfa_pending_secret_encrypted,
             mfa_pending_secret_encrypted = NULL,
             mfa_pending_expires_at = NULL,
             mfa_last_used_step = $1,
             mfa_enabled_at = NOW(),
             token_version = token_version + 1,
             updated_at = NOW()
         WHERE id = $2
         RETURNING token_version, mfa_enabled, mfa_enabled_at`,
        [verification.step, user.id]
      );
      await client.query("DELETE FROM mfa_challenges WHERE user_id = $1", [user.id]);
      await revokeUserSessions(client, user.id, "mfa_enabled");
      await appendAuditLog(client, { userId: user.id, action: "MFA_ENABLED", entity: "auth" });
      await client.query("COMMIT");

      const updated = { ...user, ...updateResult.rows[0], mfaVerified: true, authenticationMethods: ["pwd", "totp"] };
      await issueSessionCookie(res, updated, { req });
      return res.json({
        message: "MFA berhasil diaktifkan. Simpan recovery code di lokasi aman.",
        user: publicUser(updated),
        recoveryCodes: codes
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  })
);

router.post(
  "/mfa/recovery-codes/regenerate",
  authenticate,
  mfaRateLimit,
  validateBody(mfaSensitiveActionSchema),
  asyncHandler(async (req, res) => {
    const client = await getClient();
    try {
      await client.query("BEGIN");
      const result = await client.query("SELECT * FROM users WHERE id = $1 FOR UPDATE", [req.user.id]);
      const user = result.rows[0];
      if (!user?.mfa_enabled || !(await bcrypt.compare(req.body.currentPassword, user.password_hash))) {
        registerSecurityStrike(req, { type: "MFA_MANAGEMENT_AUTH_FAILED", severity: "high" });
        throw createHttpError(422, "Password atau status MFA tidak valid");
      }
      const factor = await verifyUserSecondFactor(client, user, req.body.code);
      if (!factor.valid) {
        registerSecurityStrike(req, { type: "MFA_MANAGEMENT_AUTH_FAILED", severity: "high" });
        throw createHttpError(422, "Kode MFA tidak valid");
      }

      const codes = await replaceRecoveryCodes(client, user.id);
      await appendAuditLog(client, { userId: user.id, action: "MFA_RECOVERY_CODES_REGENERATED", entity: "auth" });
      await client.query("COMMIT");
      return res.json({ message: "Recovery code baru berhasil dibuat.", recoveryCodes: codes });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  })
);

router.post(
  "/mfa/disable",
  authenticate,
  mfaRateLimit,
  validateBody(mfaSensitiveActionSchema),
  asyncHandler(async (req, res) => {
    if (isMfaRequiredRole(req.user.role) || isPasskeyRequiredRole(req.user.role)) {
      throw createHttpError(422, "MFA atau passkey wajib untuk role ini dan tidak dapat dinonaktifkan sendiri");
    }

    const client = await getClient();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `SELECT u.*, ou.name AS unit_name
         FROM users u LEFT JOIN organization_units ou ON ou.id = u.unit_id
         WHERE u.id = $1 FOR UPDATE OF u`,
        [req.user.id]
      );
      const user = result.rows[0];
      if (!user?.mfa_enabled || !(await bcrypt.compare(req.body.currentPassword, user.password_hash))) {
        registerSecurityStrike(req, { type: "MFA_MANAGEMENT_AUTH_FAILED", severity: "high" });
        throw createHttpError(422, "Password atau status MFA tidak valid");
      }
      const factor = await verifyUserSecondFactor(client, user, req.body.code);
      if (!factor.valid) {
        registerSecurityStrike(req, { type: "MFA_MANAGEMENT_AUTH_FAILED", severity: "high" });
        throw createHttpError(422, "Kode MFA tidak valid");
      }

      const updateResult = await client.query(
        `UPDATE users
         SET mfa_enabled = FALSE, mfa_secret_encrypted = NULL,
             mfa_pending_secret_encrypted = NULL, mfa_pending_expires_at = NULL,
             mfa_last_used_step = NULL, mfa_enabled_at = NULL,
             token_version = token_version + 1, updated_at = NOW()
         WHERE id = $1 RETURNING token_version`,
        [user.id]
      );
      await client.query("DELETE FROM mfa_recovery_codes WHERE user_id = $1", [user.id]);
      await client.query("DELETE FROM mfa_challenges WHERE user_id = $1", [user.id]);
      await client.query("DELETE FROM passkey_credentials WHERE user_id = $1", [user.id]);
      await revokeUserSessions(client, user.id, "mfa_disabled");
      await appendAuditLog(client, { userId: user.id, action: "MFA_DISABLED", entity: "auth" });
      await client.query("COMMIT");

      const updated = { ...user, ...updateResult.rows[0], mfa_enabled: false, mfaVerified: false, authenticationMethods: ["pwd"] };
      await issueSessionCookie(res, updated, { req });
      return res.json({
        message: "MFA berhasil dinonaktifkan.",
        user: publicUser(updated)
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  })
);

router.post(
  "/passkeys/authentication/options",
  mfaRateLimit,
  validateBody(passkeyAuthenticationOptionsSchema),
  asyncHandler(async (req, res) => {
    const result = await createPasskeyAuthentication(req.body.challengeToken);
    return res.json({ data: result });
  })
);

router.post(
  "/passkeys/authentication/verify",
  mfaRateLimit,
  validateBody(passkeyAuthenticationVerifySchema),
  asyncHandler(async (req, res) => {
    try {
      const result = await verifyPasskeyAuthentication({
        mfaChallengeToken: req.body.challengeToken,
        token: req.body.ceremonyToken,
        response: req.body.response
      });
      await issueSessionCookie(res, result.user, { req });
      return res.json({ user: publicUser(result.user) });
    } catch (error) {
      registerSecurityStrike(req, { type: "PASSKEY_AUTHENTICATION_FAILED", severity: "high" });
      throw error;
    }
  })
);

router.post(
  "/passkeys/step-up/options",
  authenticate,
  mfaRateLimit,
  validateBody(passkeyStepUpOptionsSchema),
  asyncHandler(async (req, res) => {
    const result = await createPasskeyStepUp({
      userId: req.user.id,
      sessionId: req.user.sessionDbId,
      action: req.body.action
    });
    return res.json({ data: result });
  })
);

router.post(
  "/passkeys/step-up/verify",
  authenticate,
  mfaRateLimit,
  validateBody(passkeyStepUpVerifySchema),
  asyncHandler(async (req, res) => {
    try {
      const result = await verifyPasskeyStepUp({
        userId: req.user.id,
        sessionId: req.user.sessionDbId,
        action: req.body.action,
        token: req.body.ceremonyToken,
        response: req.body.response,
        req,
        res
      });
      return res.json({
        message: "Konfirmasi passkey berhasil. Sesi keamanan telah dirotasi.",
        data: result
      });
    } catch (error) {
      registerSecurityStrike(req, {
        type: "PASSKEY_STEP_UP_FAILED",
        severity: "high",
        metadata: { action: req.body.action }
      });
      throw error;
    }
  })
);

router.get(
  "/passkeys",
  authenticate,
  asyncHandler(async (req, res) => {
    return res.json({ data: await listUserPasskeys(req.user.id) });
  })
);

router.post(
  "/passkeys/registration/options",
  authenticate,
  validateBody(passkeyRegistrationOptionsSchema),
  asyncHandler(async (req, res) => {
    const result = await query("SELECT password_hash FROM users WHERE id = $1", [req.user.id]);
    if (!result.rows[0] || !(await bcrypt.compare(req.body.currentPassword, result.rows[0].password_hash))) {
      registerSecurityStrike(req, { type: "PASSKEY_REGISTRATION_AUTH_FAILED", severity: "high" });
      throw createHttpError(422, "Password saat ini tidak sesuai");
    }
    return res.json({ data: await createPasskeyRegistration(req.user) });
  })
);

router.post(
  "/passkeys/registration/verify",
  authenticate,
  mfaRateLimit,
  validateBody(passkeyRegistrationVerifySchema),
  asyncHandler(async (req, res) => {
    try {
      const result = await verifyPasskeyRegistration({
        userId: req.user.id,
        token: req.body.ceremonyToken,
        response: req.body.response,
        name: req.body.name
      });
      await issueSessionCookie(res, result.user, { req });
      return res.json({
        message: "Passkey berhasil didaftarkan.",
        user: publicUser(result.user)
      });
    } catch (error) {
      registerSecurityStrike(req, { type: "PASSKEY_REGISTRATION_FAILED", severity: "high" });
      throw error;
    }
  })
);

router.delete(
  "/passkeys/:id",
  authenticate,
  validateBody(passkeyRemoveSchema),
  asyncHandler(async (req, res) => {
    const result = await query("SELECT password_hash FROM users WHERE id = $1", [req.user.id]);
    if (!result.rows[0] || !(await bcrypt.compare(req.body.currentPassword, result.rows[0].password_hash))) {
      registerSecurityStrike(req, { type: "PASSKEY_MANAGEMENT_AUTH_FAILED", severity: "high" });
      throw createHttpError(422, "Password saat ini tidak sesuai");
    }
    const update = await removeUserPasskey({ userId: req.user.id, passkeyId: req.params.id, role: req.user.role });
    const refreshed = await query(
      `SELECT u.*, EXISTS (SELECT 1 FROM passkey_credentials pc WHERE pc.user_id = u.id) AS passkey_enabled,
              ou.name AS unit_name
       FROM users u LEFT JOIN organization_units ou ON ou.id = u.unit_id WHERE u.id = $1`,
      [req.user.id]
    );
    const updated = {
      ...refreshed.rows[0],
      ...update,
      mfaVerified: req.user.mfaVerified,
      authenticationMethods: req.user.authenticationMethods,
      authenticationTime: req.user.authenticationTime
    };
    await issueSessionCookie(res, updated, { req });
    return res.json({ message: "Passkey berhasil dihapus.", user: publicUser(updated) });
  })
);

router.post("/logout", asyncHandler(async (req, res) => {
  const revoked = await revokeSessionFromRequest(req, "user_logout");
  clearSessionCookie(res);
  if (revoked) {
    await logActivity({
      userId: revoked.user_id,
      action: "LOGOUT",
      entity: "auth",
      metadata: { sessionId: revoked.id }
    });
  }
  return res.status(204).end();
}));

router.get(
  "/sessions",
  authenticate,
  asyncHandler(async (req, res) => {
    await query(
      `UPDATE user_sessions
       SET revoked_at = NOW(),
           revoked_reason = CASE WHEN expires_at <= NOW() THEN 'absolute_timeout' ELSE 'idle_timeout' END
       WHERE user_id = $1 AND revoked_at IS NULL
         AND (expires_at <= NOW() OR last_seen_at <= NOW() - ($2 * INTERVAL '1 second'))`,
      [req.user.id, env.sessionIdleTimeoutSeconds]
    );
    const result = await query(
      `SELECT id, auth_methods, step_up_action, step_up_at, ip_address, user_agent,
              created_at, last_seen_at, expires_at,
              last_seen_at + ($3 * INTERVAL '1 second') AS idle_expires_at,
              (id = $2) AS is_current
       FROM user_sessions
       WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > NOW()
         AND last_seen_at > NOW() - ($3 * INTERVAL '1 second')
       ORDER BY last_seen_at DESC`,
      [req.user.id, req.user.sessionDbId, env.sessionIdleTimeoutSeconds]
    );
    return res.json({
      data: result.rows,
      policy: {
        maximumActiveSessions: env.maxActiveSessions,
        idleTimeoutMinutes: Math.floor(env.sessionIdleTimeoutSeconds / 60),
        absoluteTimeoutHours: Math.floor(env.sessionCookieMaxAgeSeconds / 3600)
      }
    });
  })
);

router.delete(
  "/sessions/:id",
  authenticate,
  validateBody(passkeyRemoveSchema),
  asyncHandler(async (req, res) => {
    const sessionId = Number(req.params.id);
    if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
      throw createHttpError(422, "ID sesi tidak valid");
    }
    if (sessionId === Number(req.user.sessionDbId)) {
      throw createHttpError(422, "Gunakan tombol logout untuk mengakhiri sesi perangkat ini");
    }
    const actor = await query("SELECT password_hash FROM users WHERE id = $1", [req.user.id]);
    if (!actor.rows[0] || !(await bcrypt.compare(req.body.currentPassword, actor.rows[0].password_hash))) {
      registerSecurityStrike(req, { type: "SESSION_REVOCATION_AUTH_FAILED", severity: "high" });
      throw createHttpError(422, "Password saat ini tidak sesuai");
    }
    const result = await query(
      `UPDATE user_sessions SET revoked_at = NOW(), revoked_reason = 'user_revoke_session'
       WHERE id = $1 AND user_id = $2 AND id <> $3 AND revoked_at IS NULL
       RETURNING id`,
      [sessionId, req.user.id, req.user.sessionDbId]
    );
    if (!result.rows[0]) throw createHttpError(404, "Sesi aktif tidak ditemukan");
    await logActivity({
      userId: req.user.id,
      action: "SESSION_REVOKED",
      entity: "auth",
      metadata: { sessionId }
    });
    return res.json({ message: "Sesi perangkat berhasil dicabut." });
  })
);

router.post(
  "/sessions/revoke-others",
  authenticate,
  validateBody(passkeyRemoveSchema),
  asyncHandler(async (req, res) => {
    const actor = await query("SELECT password_hash FROM users WHERE id = $1", [req.user.id]);
    if (!actor.rows[0] || !(await bcrypt.compare(req.body.currentPassword, actor.rows[0].password_hash))) {
      registerSecurityStrike(req, { type: "SESSION_REVOCATION_AUTH_FAILED", severity: "high" });
      throw createHttpError(422, "Password saat ini tidak sesuai");
    }
    const result = await query(
      `UPDATE user_sessions SET revoked_at = NOW(), revoked_reason = 'user_revoke_others'
       WHERE user_id = $1 AND id <> $2 AND revoked_at IS NULL RETURNING id`,
      [req.user.id, req.user.sessionDbId]
    );
    await logActivity({
      userId: req.user.id,
      action: "SESSIONS_REVOKED",
      entity: "auth",
      metadata: { count: result.rowCount }
    });
    return res.json({ message: `${result.rowCount} sesi lain berhasil dicabut.` });
  })
);

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ user: publicUser(req.user) });
  })
);

router.put(
  "/profile",
  authenticate,
  validateBody(updateProfileSchema),
  asyncHandler(async (req, res) => {
    try {
      const result = await query(
        `UPDATE users
         SET name = $1,
             username = $2,
             email = $3,
             updated_at = NOW()
         WHERE id = $4
         RETURNING id, name, username, email, role, unit_id, is_active`,
        [req.body.name, req.body.username, req.body.email, req.user.id]
      );

      const userResult = await query(
        `SELECT u.id, u.name, u.username, u.email, u.role, u.unit_id, u.is_active,
                u.mfa_enabled, u.must_change_password,
                EXISTS (SELECT 1 FROM passkey_credentials pc WHERE pc.user_id = u.id) AS passkey_enabled,
                ou.name AS unit_name
         FROM users u
         LEFT JOIN organization_units ou ON ou.id = u.unit_id
         WHERE u.id = $1`,
        [req.user.id]
      );

      await logActivity({
        userId: req.user.id,
        action: "UPDATE_PROFILE",
        entity: "auth",
        metadata: { email: req.body.email }
      });

      res.json({ user: publicUser(userResult.rows[0] || result.rows[0]) });
    } catch (error) {
      if (error.code === "23505") {
        throw createHttpError(409, "Username atau email sudah digunakan");
      }
      throw error;
    }
  })
);

router.put(
  "/change-password",
  authenticate,
  validateBody(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const client = await getClient();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        "SELECT id, password_hash, token_version FROM users WHERE id = $1 FOR UPDATE",
        [req.user.id]
      );
      const user = result.rows[0];
      if (!user) throw createHttpError(404, "User tidak ditemukan");
      if (!(await bcrypt.compare(req.body.currentPassword, user.password_hash))) {
        registerSecurityStrike(req, { type: "PASSWORD_CHANGE_AUTH_FAILED", severity: "high" });
        throw createHttpError(422, "Password saat ini tidak sesuai");
      }

      await assertPasswordNotReused(client, user.id, req.body.newPassword, user.password_hash);
      const passwordHash = await bcrypt.hash(req.body.newPassword, env.bcryptRounds);
      await rememberPreviousPassword(client, user.id, user.password_hash);
      const updated = await client.query(
        `UPDATE users
         SET password_hash = $1, must_change_password = FALSE,
             token_version = token_version + 1, updated_at = NOW()
         WHERE id = $2 RETURNING token_version`,
        [passwordHash, user.id]
      );
      await revokeUserSessions(client, user.id, "password_changed");
      await appendAuditLog(client, { userId: user.id, action: "CHANGE_PASSWORD", entity: "auth" });
      await issueSessionCookie(res, {
        ...req.user,
        token_version: updated.rows[0].token_version
      }, { req, client });
      await client.query("COMMIT");
      return res.json({ message: "Password berhasil diperbarui" });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  })
);

export default router;
