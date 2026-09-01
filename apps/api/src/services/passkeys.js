import { createHash, randomBytes } from "node:crypto";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse
} from "@simplewebauthn/server";
import { env } from "../config/env.js";
import { getClient, query } from "../config/db.js";
import { createHttpError } from "../utils/http.js";
import { appendAuditLog } from "./audit.js";
import { revokeUserSessions, rotateSessionCookie } from "./session.js";

export const PASSKEY_STEP_UP_ACTIONS = Object.freeze([
  "backup-export",
  "backup-restore",
  "privileged-user-management",
  "reset-mfa",
  "unlock-account",
  "approve-critical-operation",
  "release-data-egress-hold"
]);

const passkeyStepUpActionSet = new Set(PASSKEY_STEP_UP_ACTIONS);

export function isPasskeyStepUpAction(action) {
  return passkeyStepUpActionSet.has(action);
}

function tokenHash(value) {
  return createHash("sha256").update(String(value || "")).digest("hex");
}

function ceremonyToken() {
  return randomBytes(32).toString("base64url");
}

function credentialRows(rows) {
  return rows.map((row) => ({
    id: row.credential_id,
    transports: Array.isArray(row.transports) ? row.transports : []
  }));
}

async function storeCeremony(client, {
  userId,
  challenge,
  purpose,
  mfaChallengeId = null,
  sessionId = null,
  action = null
}) {
  const token = ceremonyToken();
  const expiresAt = new Date(Date.now() + env.webauthnChallengeTtlMs);
  await client.query(
    `DELETE FROM webauthn_challenges
     WHERE expires_at < NOW() OR (user_id = $1 AND purpose = $2 AND used_at IS NULL)`,
    [userId, purpose]
  );
  try {
    await client.query(
      `INSERT INTO webauthn_challenges
         (user_id, token_hash, challenge, purpose, mfa_challenge_id, session_id, action, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, tokenHash(token), challenge, purpose, mfaChallengeId, sessionId, action, expiresAt]
    );
  } catch (error) {
    if (error.code === "23505") {
      throw createHttpError(409, "Permintaan verifikasi passkey lain sedang diproses. Coba kembali");
    }
    throw error;
  }
  return { token, expiresAt };
}

export function isPasskeyRequiredRole(role) {
  return env.passkeyRequiredRoles.includes(role);
}

export async function createPasskeyRegistration(user) {
  const credentials = await query(
    "SELECT credential_id, transports FROM passkey_credentials WHERE user_id = $1",
    [user.id]
  );
  const options = await generateRegistrationOptions({
    rpName: env.webauthnRpName,
    rpID: env.webauthnRpId,
    userID: new TextEncoder().encode(String(user.id)),
    userName: user.email || user.username,
    userDisplayName: user.name,
    attestationType: "none",
    timeout: 60000,
    excludeCredentials: credentialRows(credentials.rows),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "required"
    },
    supportedAlgorithmIDs: [-7, -257]
  });

  const stored = await storeCeremony({ query: (...args) => query(...args) }, {
    userId: user.id,
    challenge: options.challenge,
    purpose: "registration"
  });
  return { options, ceremonyToken: stored.token, expiresAt: stored.expiresAt };
}

export async function verifyPasskeyRegistration({ userId, token, response, name }) {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const ceremonyResult = await client.query(
      `SELECT wc.*, u.name AS user_name, u.username, u.email, u.role, u.unit_id,
              u.is_active, u.token_version, u.must_change_password, ou.name AS unit_name
       FROM webauthn_challenges wc
       JOIN users u ON u.id = wc.user_id
       LEFT JOIN organization_units ou ON ou.id = u.unit_id
       WHERE wc.token_hash = $1 AND wc.user_id = $2 AND wc.purpose = 'registration'
       FOR UPDATE OF wc, u`,
      [tokenHash(token), userId]
    );
    const ceremony = ceremonyResult.rows[0];
    if (!ceremony || ceremony.used_at || new Date(ceremony.expires_at) <= new Date() || !ceremony.is_active) {
      throw createHttpError(422, "Sesi pendaftaran passkey sudah berakhir");
    }

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: ceremony.challenge,
      expectedOrigin: env.webauthnOrigins,
      expectedRPID: env.webauthnRpId,
      requireUserVerification: true
    });
    if (!verification.verified || !verification.registrationInfo) {
      throw createHttpError(422, "Passkey tidak dapat diverifikasi");
    }

    const info = verification.registrationInfo;
    const transports = info.credential.transports || response?.response?.transports || [];
    await client.query(
      `INSERT INTO passkey_credentials
         (user_id, credential_id, public_key, counter, transports, device_type, backed_up, name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        info.credential.id,
        Buffer.from(info.credential.publicKey),
        info.credential.counter,
        JSON.stringify(transports),
        info.credentialDeviceType,
        info.credentialBackedUp,
        String(name || "Passkey").trim().slice(0, 100)
      ]
    );
    const update = await client.query(
      `UPDATE users
       SET mfa_enabled = TRUE, mfa_enabled_at = COALESCE(mfa_enabled_at, NOW()),
           token_version = token_version + 1, updated_at = NOW()
       WHERE id = $1 RETURNING token_version, mfa_enabled, mfa_enabled_at`,
      [userId]
    );
    await revokeUserSessions(client, userId, "passkey_registered");
    await client.query("UPDATE webauthn_challenges SET used_at = NOW() WHERE id = $1", [ceremony.id]);
    await appendAuditLog(client, {
      userId,
      action: "PASSKEY_REGISTERED",
      entity: "auth",
      metadata: { name: String(name || "Passkey").slice(0, 100), deviceType: info.credentialDeviceType }
    });
    await client.query("COMMIT");

    return {
      user: {
        id: userId,
        name: ceremony.user_name,
        username: ceremony.username,
        email: ceremony.email,
        role: ceremony.role,
        unit_id: ceremony.unit_id,
        unit_name: ceremony.unit_name,
        is_active: ceremony.is_active,
        ...update.rows[0],
        passkey_enabled: true,
        mfaVerified: true,
        authenticationMethods: ["pwd", "webauthn"]
      }
    };
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23505") throw createHttpError(409, "Passkey tersebut sudah terdaftar");
    throw error;
  } finally {
    client.release();
  }
}

export async function createPasskeyAuthentication(mfaChallengeToken) {
  const challengeResult = await query(
    `SELECT c.id, c.user_id
     FROM mfa_challenges c
     JOIN users u ON u.id = c.user_id
     WHERE c.token_hash = $1 AND c.used_at IS NULL AND c.expires_at > NOW()
       AND c.attempt_count < 5 AND u.is_active = TRUE AND u.mfa_enabled = TRUE`,
    [tokenHash(mfaChallengeToken)]
  );
  const mfaChallenge = challengeResult.rows[0];
  if (!mfaChallenge) throw createHttpError(422, "Challenge login sudah berakhir");

  const credentials = await query(
    "SELECT credential_id, transports FROM passkey_credentials WHERE user_id = $1",
    [mfaChallenge.user_id]
  );
  if (!credentials.rows.length) throw createHttpError(409, "Akun belum memiliki passkey");

  const options = await generateAuthenticationOptions({
    rpID: env.webauthnRpId,
    timeout: 60000,
    allowCredentials: credentialRows(credentials.rows),
    userVerification: "required"
  });
  const stored = await storeCeremony({ query: (...args) => query(...args) }, {
    userId: mfaChallenge.user_id,
    challenge: options.challenge,
    purpose: "authentication",
    mfaChallengeId: mfaChallenge.id
  });
  return { options, ceremonyToken: stored.token, expiresAt: stored.expiresAt };
}

export async function verifyPasskeyAuthentication({ mfaChallengeToken, token, response }) {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `SELECT wc.id AS ceremony_id, wc.challenge, wc.expires_at AS ceremony_expires_at,
              wc.used_at AS ceremony_used_at, c.id AS mfa_challenge_id, c.expires_at,
              c.used_at, c.attempt_count, u.id, u.name, u.username, u.email, u.role,
              u.unit_id, u.is_active, u.token_version, u.must_change_password, u.mfa_enabled, ou.name AS unit_name
       FROM webauthn_challenges wc
       JOIN mfa_challenges c ON c.id = wc.mfa_challenge_id
       JOIN users u ON u.id = wc.user_id
       LEFT JOIN organization_units ou ON ou.id = u.unit_id
       WHERE wc.token_hash = $1 AND c.token_hash = $2 AND wc.purpose = 'authentication'
       FOR UPDATE OF wc, c, u`,
      [tokenHash(token), tokenHash(mfaChallengeToken)]
    );
    const user = result.rows[0];
    if (!user || user.ceremony_used_at || user.used_at || !user.is_active ||
        new Date(user.ceremony_expires_at) <= new Date() || new Date(user.expires_at) <= new Date() ||
        user.attempt_count >= 5) {
      throw createHttpError(422, "Sesi autentikasi passkey sudah berakhir");
    }

    const credentialResult = await client.query(
      `SELECT * FROM passkey_credentials
       WHERE user_id = $1 AND credential_id = $2 FOR UPDATE`,
      [user.id, response?.id]
    );
    const credential = credentialResult.rows[0];
    if (!credential) throw createHttpError(401, "Passkey tidak dikenali");

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: user.challenge,
      expectedOrigin: env.webauthnOrigins,
      expectedRPID: env.webauthnRpId,
      credential: {
        id: credential.credential_id,
        publicKey: new Uint8Array(credential.public_key),
        counter: Number(credential.counter),
        transports: Array.isArray(credential.transports) ? credential.transports : []
      },
      requireUserVerification: true
    });
    if (!verification.verified) throw createHttpError(401, "Verifikasi passkey gagal");

    await client.query(
      `UPDATE passkey_credentials
       SET counter = $1, device_type = $2, backed_up = $3, last_used_at = NOW()
       WHERE id = $4`,
      [verification.authenticationInfo.newCounter, verification.authenticationInfo.credentialDeviceType,
        verification.authenticationInfo.credentialBackedUp, credential.id]
    );
    await client.query("UPDATE webauthn_challenges SET used_at = NOW() WHERE id = $1", [user.ceremony_id]);
    await client.query("UPDATE mfa_challenges SET used_at = NOW() WHERE id = $1", [user.mfa_challenge_id]);
    await appendAuditLog(client, { userId: user.id, action: "LOGIN_PASSKEY_SUCCESS", entity: "auth" });
    await client.query("COMMIT");
    return {
      user: { ...user, passkey_enabled: true, mfaVerified: true, authenticationMethods: ["pwd", "webauthn"] }
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function createPasskeyStepUp({ userId, sessionId, action }) {
  if (!isPasskeyStepUpAction(action)) throw createHttpError(422, "Jenis operasi step-up tidak valid");

  const session = await query(
    `SELECT us.id FROM user_sessions us
     JOIN users u ON u.id = us.user_id AND u.is_active = TRUE
       AND u.token_version = us.token_version
     WHERE us.id = $1 AND us.user_id = $2 AND us.revoked_at IS NULL
       AND us.expires_at > NOW()
       AND us.last_seen_at > NOW() - ($3 * INTERVAL '1 second')`,
    [sessionId, userId, env.sessionIdleTimeoutSeconds]
  );
  if (!session.rows[0]) throw createHttpError(401, "Sesi aktif tidak ditemukan. Silakan login kembali");

  const credentials = await query(
    "SELECT credential_id, transports FROM passkey_credentials WHERE user_id = $1",
    [userId]
  );
  if (!credentials.rows.length) throw createHttpError(409, "Akun belum memiliki passkey");

  const options = await generateAuthenticationOptions({
    rpID: env.webauthnRpId,
    timeout: 60000,
    allowCredentials: credentialRows(credentials.rows),
    userVerification: "required"
  });
  const stored = await storeCeremony({ query: (...args) => query(...args) }, {
    userId,
    challenge: options.challenge,
    purpose: "step_up",
    sessionId,
    action
  });
  return { options, ceremonyToken: stored.token, action, expiresAt: stored.expiresAt };
}

export async function verifyPasskeyStepUp({
  userId,
  sessionId,
  action,
  token,
  response,
  req,
  res
}) {
  if (!isPasskeyStepUpAction(action)) throw createHttpError(422, "Jenis operasi step-up tidak valid");

  const client = await getClient();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `SELECT wc.id AS ceremony_id, wc.challenge, wc.expires_at AS ceremony_expires_at,
              wc.used_at AS ceremony_used_at, wc.action, wc.session_id,
              u.id, u.name, u.username, u.email, u.role, u.unit_id, u.is_active,
              u.token_version, u.must_change_password, u.mfa_enabled, ou.name AS unit_name,
              us.auth_methods AS session_auth_methods
       FROM webauthn_challenges wc
       JOIN users u ON u.id = wc.user_id
       JOIN user_sessions us ON us.id = wc.session_id AND us.user_id = wc.user_id
         AND us.revoked_at IS NULL AND us.expires_at > NOW()
         AND us.last_seen_at > NOW() - ($5 * INTERVAL '1 second')
         AND us.token_version = u.token_version
       LEFT JOIN organization_units ou ON ou.id = u.unit_id
       WHERE wc.token_hash = $1 AND wc.user_id = $2 AND wc.session_id = $3
         AND wc.action = $4 AND wc.purpose = 'step_up'
       FOR UPDATE OF wc, u, us`,
      [tokenHash(token), userId, sessionId, action, env.sessionIdleTimeoutSeconds]
    );
    const user = result.rows[0];
    if (!user || user.ceremony_used_at || !user.is_active ||
        new Date(user.ceremony_expires_at) <= new Date()) {
      throw createHttpError(422, "Sesi verifikasi passkey sudah berakhir");
    }

    const credentialResult = await client.query(
      `SELECT * FROM passkey_credentials
       WHERE user_id = $1 AND credential_id = $2 FOR UPDATE`,
      [user.id, response?.id]
    );
    const credential = credentialResult.rows[0];
    if (!credential) throw createHttpError(401, "Passkey tidak dikenali");

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: user.challenge,
      expectedOrigin: env.webauthnOrigins,
      expectedRPID: env.webauthnRpId,
      credential: {
        id: credential.credential_id,
        publicKey: new Uint8Array(credential.public_key),
        counter: Number(credential.counter),
        transports: Array.isArray(credential.transports) ? credential.transports : []
      },
      requireUserVerification: true
    });
    if (!verification.verified) throw createHttpError(401, "Verifikasi passkey gagal");

    await client.query(
      `UPDATE passkey_credentials
       SET counter = $1, device_type = $2, backed_up = $3, last_used_at = NOW()
       WHERE id = $4`,
      [verification.authenticationInfo.newCounter, verification.authenticationInfo.credentialDeviceType,
        verification.authenticationInfo.credentialBackedUp, credential.id]
    );
    await client.query("UPDATE webauthn_challenges SET used_at = NOW() WHERE id = $1", [user.ceremony_id]);
    const rotation = await rotateSessionCookie(client, res, {
      ...user,
      tokenVersion: user.token_version,
      authenticationMethods: Array.isArray(user.session_auth_methods) ? user.session_auth_methods : []
    }, { req, currentSessionDbId: sessionId, stepUpAction: action });
    await appendAuditLog(client, {
      userId: user.id,
      action: "PASSKEY_STEP_UP_SUCCESS",
      entity: "auth",
      metadata: { operation: action, previousSessionId: sessionId }
    });
    await client.query("COMMIT");
    res.append("Set-Cookie", rotation.cookieHeader);
    return { action };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listUserPasskeys(userId) {
  const result = await query(
    `SELECT id, name, device_type, backed_up, last_used_at, created_at
     FROM passkey_credentials WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function removeUserPasskey({ userId, passkeyId, role }) {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const credentials = await client.query(
      "SELECT id FROM passkey_credentials WHERE user_id = $1 FOR UPDATE",
      [userId]
    );
    if (!credentials.rows.some((item) => Number(item.id) === Number(passkeyId))) {
      throw createHttpError(404, "Passkey tidak ditemukan");
    }
    if (isPasskeyRequiredRole(role) && credentials.rows.length <= 1) {
      throw createHttpError(422, "Role ini wajib memiliki minimal satu passkey aktif");
    }
    await client.query("DELETE FROM passkey_credentials WHERE id = $1 AND user_id = $2", [passkeyId, userId]);
    const update = await client.query(
      `UPDATE users
       SET mfa_enabled = (mfa_secret_encrypted IS NOT NULL OR EXISTS (
             SELECT 1 FROM passkey_credentials WHERE user_id = $1
           )), token_version = token_version + 1, updated_at = NOW()
       WHERE id = $1 RETURNING token_version, mfa_enabled`,
      [userId]
    );
    await revokeUserSessions(client, userId, "passkey_removed");
    await client.query("DELETE FROM mfa_challenges WHERE user_id = $1", [userId]);
    await appendAuditLog(client, { userId, action: "PASSKEY_REMOVED", entity: "auth", entityId: Number(passkeyId) });
    await client.query("COMMIT");
    return update.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
