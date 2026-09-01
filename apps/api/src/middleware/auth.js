import { query } from "../config/db.js";
import { createHttpError, asyncHandler } from "../utils/http.js";
import { verifyAccessToken } from "../services/tokens.js";
import { registerSecurityStrike } from "./security.js";
import { isMfaRequiredRole } from "../services/mfa.js";
import { isPasskeyRequiredRole } from "../services/passkeys.js";
import { clearSessionCookie, cookieValue, sessionHash } from "../services/session.js";
import { env } from "../config/env.js";
import { recordSecurityEvent } from "../services/securityEvents.js";

export const GLOBAL_ROLES = ["Admin", "Inspektur", "Sekretaris", "Umpeg"];

function clearBrowserSession(req, res) {
  if (cookieValue(req)) clearSessionCookie(res);
}

export const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const headerToken = header.startsWith("Bearer ") ? header.slice(7).trim() : null;
  const token = headerToken || cookieValue(req);

  if (!token) {
    throw createHttpError(401, "Token tidak ditemukan");
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    clearBrowserSession(req, res);
    registerSecurityStrike(req, {
      type: "INVALID_ACCESS_TOKEN",
      severity: "medium",
      metadata: { reason: error.name || "verify_failed" }
    });
    throw createHttpError(401, "Token tidak valid atau sudah kedaluwarsa");
  }

  if (!payload.jti) {
    clearBrowserSession(req, res);
    registerSecurityStrike(req, { type: "LEGACY_SESSION_REJECTED", severity: "medium" });
    throw createHttpError(401, "Sesi lama tidak berlaku. Silakan login kembali");
  }

  const result = await query(
    `SELECT u.id, u.name, u.username, u.email, u.role, u.unit_id, u.is_active, u.token_version,
            u.must_change_password,
            u.mfa_enabled,
            EXISTS (SELECT 1 FROM passkey_credentials pc WHERE pc.user_id = u.id) AS passkey_enabled,
            ou.name AS unit_name,
            us.id AS session_db_id, us.token_version AS session_token_version,
            us.auth_methods AS session_auth_methods, us.step_up_action, us.step_up_at,
            us.last_seen_at
     FROM users u
     JOIN user_sessions us ON us.user_id = u.id AND us.session_hash = $2
       AND us.revoked_at IS NULL AND us.expires_at > NOW()
       AND us.last_seen_at > NOW() - ($3 * INTERVAL '1 second')
     LEFT JOIN organization_units ou ON ou.id = u.unit_id
     WHERE u.id = $1`,
    [payload.sub, sessionHash(payload.jti), env.sessionIdleTimeoutSeconds]
  );

  const user = result.rows[0];
  if (!user) {
    const expired = await query(
      `UPDATE user_sessions
       SET revoked_at = NOW(),
           revoked_reason = CASE WHEN expires_at <= NOW() THEN 'absolute_timeout' ELSE 'idle_timeout' END
       WHERE session_hash = $1 AND revoked_at IS NULL
         AND (expires_at <= NOW() OR last_seen_at <= NOW() - ($2 * INTERVAL '1 second'))
       RETURNING user_id, revoked_reason`,
      [sessionHash(payload.jti), env.sessionIdleTimeoutSeconds]
    );
    if (expired.rows[0]) {
      clearBrowserSession(req, res);
      await recordSecurityEvent({
        type: "SESSION_EXPIRED",
        severity: "low",
        req,
        userId: expired.rows[0].user_id,
        metadata: { reason: expired.rows[0].revoked_reason }
      });
      throw createHttpError(401, "Sesi berakhir. Silakan login kembali");
    }
    clearBrowserSession(req, res);
    registerSecurityStrike(req, {
      type: "REVOKED_SESSION_REUSE",
      severity: "high"
    });
    throw createHttpError(401, "Sesi sudah dicabut atau kedaluwarsa");
  }
  if (!user.is_active) {
    clearBrowserSession(req, res);
    registerSecurityStrike(req, { type: "INACTIVE_ACCOUNT_TOKEN", severity: "medium" });
    throw createHttpError(401, "Akun tidak aktif");
  }
  if (Number(payload.ver || 0) !== Number(user.token_version || 0) ||
      Number(user.session_token_version || 0) !== Number(user.token_version || 0)) {
    clearBrowserSession(req, res);
    registerSecurityStrike(req, {
      type: "REVOKED_TOKEN_REUSE",
      severity: "high",
      metadata: { userId: user.id }
    });
    throw createHttpError(401, "Sesi sudah dicabut. Silakan login kembali");
  }

  const activityUpdateSeconds = Math.min(300, Math.max(30, Math.floor(env.sessionIdleTimeoutSeconds / 3)));
  if (new Date(user.last_seen_at).getTime() < Date.now() - activityUpdateSeconds * 1000) {
    await query("UPDATE user_sessions SET last_seen_at = NOW() WHERE id = $1", [user.session_db_id]);
  }

  const authenticationMethods = Array.isArray(user.session_auth_methods) ? user.session_auth_methods : [];

  req.user = {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    unitId: user.unit_id,
    unitName: user.unit_name,
    mfaEnabled: Boolean(user.mfa_enabled),
    mfaRequired: isMfaRequiredRole(user.role),
    mfaSetupRequired: isMfaRequiredRole(user.role) && !user.mfa_enabled,
    mfaVerified: payload.mfa === true && authenticationMethods.some((method) => method !== "pwd"),
    passkeyEnabled: Boolean(user.passkey_enabled),
    passkeyRequired: isPasskeyRequiredRole(user.role),
    passkeySetupRequired: isPasskeyRequiredRole(user.role) && !user.passkey_enabled,
    authenticationMethods,
    authenticationTime: user.step_up_at
      ? Math.floor(new Date(user.step_up_at).getTime() / 1000)
      : Number(payload.auth_time || payload.iat || 0),
    stepUpAction: user.step_up_action || null,
    tokenIssuedAt: Number(payload.iat || 0),
    sessionDbId: user.session_db_id,
    tokenVersion: Number(user.token_version || 0)
  };
  req.user.passwordChangeRequired = Boolean(user.must_change_password);

  if (user.mfa_enabled && payload.mfa !== true) {
    clearBrowserSession(req, res);
    throw createHttpError(401, "Verifikasi MFA diperlukan. Silakan login kembali");
  }

  const enrollmentPathAllowed = /^\/api\/auth\/(?:me|profile|change-password|mfa(?:\/|$)|passkeys(?:\/|$)|sessions(?:\/|$))/.test(req.originalUrl || "");
  if ((req.user.passwordChangeRequired || req.user.mfaSetupRequired || req.user.passkeySetupRequired) && !enrollmentPathAllowed) {
    throw createHttpError(403, "Password awal, MFA, dan passkey wajib diselesaikan sebelum menggunakan fitur SIPADI lainnya");
  }

  next();
});

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(createHttpError(401, "Autentikasi diperlukan"));
    if (!roles.includes(req.user.role)) {
      return next(createHttpError(403, "Role Anda tidak memiliki akses ke fitur ini"));
    }
    return next();
  };
}

export function hasRecentPasskey(user, nowSeconds = Math.floor(Date.now() / 1000), requiredAction = null) {
  const recentlyAuthenticated = Number(user?.authenticationTime || 0) >=
    nowSeconds - env.privilegedReauthMaxAgeSeconds;
  const actionMatches = !requiredAction || user?.stepUpAction === requiredAction;
  return recentlyAuthenticated && actionMatches && user?.authenticationMethods?.includes("webauthn");
}

export function requireRecentPasskey(req, res, next) {
  if (!hasRecentPasskey(req.user)) {
    return next(createHttpError(403, `Operasi ini memerlukan login ulang dengan passkey dalam ${Math.ceil(env.privilegedReauthMaxAgeSeconds / 60)} menit terakhir`));
  }
  return next();
}

export function requireRecentPasskeyFor(action) {
  return (req, res, next) => {
    if (!hasRecentPasskey(req.user, Math.floor(Date.now() / 1000), action)) {
      return next(createHttpError(
        403,
        "Konfirmasi passkey diperlukan untuk melanjutkan operasi sensitif ini",
        {
          code: "PASSKEY_STEP_UP_REQUIRED",
          action,
          maxAgeMinutes: Math.ceil(env.privilegedReauthMaxAgeSeconds / 60)
        }
      ));
    }
    return next();
  };
}

export function canAccessAll(user) {
  return GLOBAL_ROLES.includes(user.role);
}

export function enforceUnitScope(req, requestedUnitId) {
  if (canAccessAll(req.user)) return requestedUnitId || null;
  return req.user.unitId;
}
