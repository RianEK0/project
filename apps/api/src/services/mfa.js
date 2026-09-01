import { createHash, createHmac, randomBytes } from "node:crypto";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { env } from "../config/env.js";
import { getClient, query } from "../config/db.js";
import { decryptEnvelope, encryptEnvelope, parseEncryptionKey, selectEncryptionKey } from "./cryptoEnvelope.js";

const TOTP_PERIOD_SECONDS = 30;
const TOTP_DIGITS = 6;
const RECOVERY_CODE_COUNT = 10;
const MFA_ISSUER = "SIPADI Inspektorat Kota Depok";

function mfaKey() {
  return parseEncryptionKey(env.mfaEncryptionKey, "MFA_ENCRYPTION_KEY");
}

function recoveryPepper() {
  const value = String(env.recoveryCodePepper || "");
  if (value.length < 32) {
    const error = new Error("RECOVERY_CODE_PEPPER belum dikonfigurasi dengan aman");
    error.code = "RECOVERY_CODE_PEPPER_MISSING";
    throw error;
  }
  return value;
}

function secretAad(userId) {
  return `sipadi:mfa:user:${userId}`;
}

function totpFor(secret, label) {
  return new OTPAuth.TOTP({
    issuer: MFA_ISSUER,
    label,
    algorithm: "SHA1",
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD_SECONDS,
    secret: OTPAuth.Secret.fromBase32(secret)
  });
}

function challengeHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function isMfaRequiredRole(role) {
  return env.mfaRequiredRoles.includes(role);
}

export function encryptMfaSecret(secret, userId) {
  return JSON.stringify(encryptEnvelope(secret, {
    key: mfaKey(),
    keyId: env.mfaEncryptionKeyId,
    aad: secretAad(userId)
  }));
}

export function decryptMfaSecret(value, userId) {
  const envelope = typeof value === "string" ? JSON.parse(value) : value;
  return decryptEnvelope(envelope, {
    key: selectEncryptionKey(envelope, {
      currentKey: env.mfaEncryptionKey,
      currentKeyId: env.mfaEncryptionKeyId,
      previousKeys: env.mfaPreviousEncryptionKeys,
      name: "MFA_ENCRYPTION_KEY"
    }),
    aad: secretAad(userId)
  }).toString("utf8");
}

export async function createMfaEnrollment(user) {
  const secret = new OTPAuth.Secret({ size: 20 }).base32;
  const totp = totpFor(secret, user.email || user.username || String(user.id));
  const uri = totp.toString();
  const qrCodeDataUrl = await QRCode.toDataURL(uri, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 240
  });

  return { secret, uri, qrCodeDataUrl };
}

export function verifyTotp(secret, code, lastUsedStep = null) {
  const token = String(code || "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(token)) return { valid: false, reason: "format" };

  const totp = totpFor(secret, "verification");
  const delta = totp.validate({ token, window: 1 });
  if (delta === null) return { valid: false, reason: "invalid" };

  const step = Math.floor(Date.now() / 1000 / TOTP_PERIOD_SECONDS) + delta;
  if (lastUsedStep !== null && step <= Number(lastUsedStep)) {
    return { valid: false, reason: "replayed" };
  }
  return { valid: true, step };
}

export function normalizeRecoveryCode(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function hashRecoveryCode(userId, value) {
  return createHmac("sha256", recoveryPepper())
    .update(`sipadi:recovery:${userId}:${normalizeRecoveryCode(value)}`)
    .digest("hex");
}

export function generateRecoveryCodes() {
  return Array.from({ length: RECOVERY_CODE_COUNT }, () => {
    const raw = randomBytes(10).toString("hex").toUpperCase();
    return raw.match(/.{1,4}/g).join("-");
  });
}

export async function replaceRecoveryCodes(client, userId) {
  const codes = generateRecoveryCodes();
  await client.query("DELETE FROM mfa_recovery_codes WHERE user_id = $1", [userId]);
  for (const code of codes) {
    await client.query(
      "INSERT INTO mfa_recovery_codes (user_id, code_hash) VALUES ($1, $2)",
      [userId, hashRecoveryCode(userId, code)]
    );
  }
  return codes;
}

export async function verifyUserSecondFactor(client, user, code) {
  let totpResult = { valid: false, reason: "totp_not_enabled" };
  if (user.mfa_secret_encrypted) {
    const secret = decryptMfaSecret(user.mfa_secret_encrypted, user.id);
    totpResult = verifyTotp(secret, code, user.mfa_last_used_step);
    if (totpResult.valid) {
      await client.query("UPDATE users SET mfa_last_used_step = $1 WHERE id = $2", [totpResult.step, user.id]);
      return { valid: true, method: "totp" };
    }
  }

  const normalized = normalizeRecoveryCode(code);
  if (normalized.length === 20) {
    const recoveryResult = await client.query(
      `UPDATE mfa_recovery_codes
       SET used_at = NOW()
       WHERE user_id = $1 AND code_hash = $2 AND used_at IS NULL
       RETURNING id`,
      [user.id, hashRecoveryCode(user.id, normalized)]
    );
    if (recoveryResult.rows[0]) return { valid: true, method: "recovery" };
  }

  return { valid: false, method: null, reason: totpResult.reason };
}

export async function createMfaChallenge(userId) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + env.mfaChallengeTtlMs);
  await query("DELETE FROM mfa_challenges WHERE user_id = $1 OR expires_at < NOW()", [userId]);
  await query(
    `INSERT INTO mfa_challenges (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, challengeHash(token), expiresAt]
  );
  return { token, expiresAt };
}

export async function consumeMfaChallenge(token, code) {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `SELECT c.id AS challenge_id, c.expires_at, c.used_at, c.attempt_count,
              u.id, u.name, u.username, u.email, u.role, u.unit_id, u.is_active,
              u.token_version, u.must_change_password, u.mfa_enabled, u.mfa_secret_encrypted, u.mfa_last_used_step,
              EXISTS (SELECT 1 FROM passkey_credentials pc WHERE pc.user_id = u.id) AS passkey_enabled,
              ou.name AS unit_name
       FROM mfa_challenges c
       JOIN users u ON u.id = c.user_id
       LEFT JOIN organization_units ou ON ou.id = u.unit_id
       WHERE c.token_hash = $1
       FOR UPDATE OF c, u`,
      [challengeHash(token)]
    );
    const user = result.rows[0];

    if (!user || !user.is_active || !user.mfa_enabled || user.used_at || new Date(user.expires_at) <= new Date()) {
      await client.query("ROLLBACK");
      return { valid: false, reason: "expired" };
    }
    if (user.attempt_count >= 5) {
      await client.query("ROLLBACK");
      return { valid: false, reason: "locked" };
    }

    const factor = await verifyUserSecondFactor(client, user, code);
    if (!factor.valid) {
      await client.query(
        "UPDATE mfa_challenges SET attempt_count = attempt_count + 1 WHERE id = $1",
        [user.challenge_id]
      );
      await client.query("COMMIT");
      return { valid: false, reason: factor.reason || "invalid" };
    }

    await client.query(
      "UPDATE mfa_challenges SET used_at = NOW() WHERE id = $1",
      [user.challenge_id]
    );
    await client.query("COMMIT");
    return { valid: true, method: factor.method, user };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
