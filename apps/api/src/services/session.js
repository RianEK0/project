import { createHash, randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { query } from "../config/db.js";
import { signAccessToken, verifyAccessToken } from "./tokens.js";
import { recordSecurityEvent } from "./securityEvents.js";
import { createHttpError } from "../utils/http.js";

const productionCookieName = "__Host-sipadi_session";
const developmentCookieName = "sipadi_session";

export function sessionCookieName() {
  return env.nodeEnv === "production" ? productionCookieName : developmentCookieName;
}

function serializeCookie(name, value, { maxAge = env.sessionCookieMaxAgeSeconds } = {}) {
  const attributes = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    "Priority=High",
    `Max-Age=${Math.max(0, Math.floor(maxAge))}`
  ];
  if (env.nodeEnv === "production") attributes.push("Secure");
  return attributes.join("; ");
}

export function sessionHash(sessionId) {
  return createHash("sha256").update(String(sessionId || "")).digest("hex");
}

function requestMetadata(req) {
  return {
    ipAddress: String(req?.ip || "").slice(0, 64) || null,
    userAgent: String(req?.get?.("user-agent") || "").replace(/[\r\n\u0000-\u001f]/g, "_").slice(0, 300) || null
  };
}

export async function issueSessionCookie(res, user, { req = null, client = null, deferCookie = false } = {}) {
  const sessionId = randomUUID();
  const authenticationTime = Number(user.authenticationTime || Math.floor(Date.now() / 1000));
  const authMethods = Array.isArray(user.authenticationMethods)
    ? user.authenticationMethods.slice(0, 5)
    : (user.mfaVerified ? ["mfa"] : ["pwd"]);
  const expiresAt = new Date(Date.now() + env.sessionCookieMaxAgeSeconds * 1000);
  const metadata = requestMetadata(req);
  const executor = client || { query: (...args) => query(...args) };
  const stepUpAction = user.stepUpAction ? String(user.stepUpAction).slice(0, 80) : null;
  const stepUpAt = stepUpAction ? new Date(authenticationTime * 1000) : null;

  await executor.query(
    `INSERT INTO user_sessions
       (user_id, session_hash, token_version, auth_methods, step_up_action, step_up_at,
        ip_address, user_agent, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [user.id, sessionHash(sessionId), Number(user.token_version || user.tokenVersion || 0),
      JSON.stringify(authMethods), stepUpAction, stepUpAt, metadata.ipAddress, metadata.userAgent, expiresAt]
  );
  await executor.query(
    `UPDATE user_sessions
     SET revoked_at = NOW(),
         revoked_reason = CASE WHEN expires_at <= NOW() THEN 'absolute_timeout' ELSE 'idle_timeout' END
     WHERE user_id = $1 AND revoked_at IS NULL
       AND (expires_at <= NOW() OR last_seen_at <= NOW() - ($2 * INTERVAL '1 second'))`,
    [user.id, env.sessionIdleTimeoutSeconds]
  );
  const limited = await executor.query(
    `WITH ranked AS (
       SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC, id DESC) AS position
       FROM user_sessions
       WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > NOW()
     )
     UPDATE user_sessions us
     SET revoked_at = NOW(), revoked_reason = 'concurrent_session_limit'
     FROM ranked
     WHERE us.id = ranked.id AND ranked.position > $2
     RETURNING us.id`,
    [user.id, env.maxActiveSessions]
  );
  await executor.query(
    "DELETE FROM user_sessions WHERE expires_at < NOW() - INTERVAL '7 days' OR revoked_at < NOW() - INTERVAL '30 days'"
  );

  const token = signAccessToken(user, { sessionId, authenticationTime });
  const cookieHeader = serializeCookie(sessionCookieName(), token);
  if (!deferCookie) res.append("Set-Cookie", cookieHeader);
  if (limited.rowCount && req) {
    await recordSecurityEvent({
      type: "CONCURRENT_SESSION_LIMIT_ENFORCED",
      severity: "medium",
      req,
      userId: user.id,
      metadata: { revokedSessions: limited.rowCount, maximumActiveSessions: env.maxActiveSessions }
    });
  }
  return { revokedBySessionLimit: limited.rowCount || 0, cookieHeader };
}

export async function rotateSessionCookie(executor, res, user, { req, currentSessionDbId, stepUpAction }) {
  const revoked = await executor.query(
    `UPDATE user_sessions
     SET revoked_at = NOW(), revoked_reason = 'passkey_step_up_rotation'
     WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL AND expires_at > NOW()
     RETURNING id`,
    [currentSessionDbId, user.id]
  );
  if (!revoked.rows[0]) {
    throw createHttpError(401, "Sesi aktif tidak ditemukan. Silakan login kembali");
  }

  const authenticationMethods = Array.from(new Set([...(user.authenticationMethods || []), "webauthn"]));
  const issued = await issueSessionCookie(res, {
    ...user,
    mfaVerified: true,
    authenticationMethods,
    authenticationTime: Math.floor(Date.now() / 1000),
    stepUpAction
  }, { req, client: executor, deferCookie: true });
  return { previousSession: revoked.rows[0], cookieHeader: issued.cookieHeader };
}

export function clearSessionCookie(res) {
  res.append("Set-Cookie", serializeCookie(sessionCookieName(), "", { maxAge: 0 }));
  // Hapus nama cookie development lama saat migrasi deployment.
  if (sessionCookieName() !== developmentCookieName) {
    res.append("Set-Cookie", serializeCookie(developmentCookieName, "", { maxAge: 0 }));
  }
}

export function cookieValue(req, name = sessionCookieName()) {
  const raw = String(req.headers.cookie || "");
  for (const part of raw.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0 || part.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }
  return null;
}

export async function revokeSessionFromRequest(req, reason = "logout") {
  const header = String(req.headers.authorization || "");
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : cookieValue(req);
  if (!token) return false;
  try {
    const payload = verifyAccessToken(token);
    if (!payload.jti) return false;
    const result = await query(
      `UPDATE user_sessions SET revoked_at = COALESCE(revoked_at, NOW()), revoked_reason = $1
       WHERE session_hash = $2 AND revoked_at IS NULL RETURNING id, user_id`,
      [String(reason).slice(0, 120), sessionHash(payload.jti)]
    );
    return result.rows[0] || null;
  } catch {
    return null;
  }
}

export async function revokeUserSessions(executor, userId, reason, exceptSessionId = null) {
  const result = await executor.query(
    `UPDATE user_sessions
     SET revoked_at = COALESCE(revoked_at, NOW()), revoked_reason = $2
     WHERE user_id = $1 AND revoked_at IS NULL
       AND ($3::bigint IS NULL OR id <> $3)
     RETURNING id`,
    [userId, String(reason || "security_change").slice(0, 120), exceptSessionId]
  );
  return result.rowCount;
}
