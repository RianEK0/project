import dotenv from "dotenv";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const numberFromEnv = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const boundedNumberFromEnv = (value, fallback, min, max) => {
  const parsed = numberFromEnv(value, fallback);
  return Math.min(Math.max(parsed, min), max);
};

const booleanFromEnv = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
};

const enumFromEnv = (value, fallback, allowed) => {
  const normalized = String(value || fallback).trim().toLowerCase();
  return allowed.includes(normalized) ? normalized : fallback;
};

const secretFromEnv = (name, fallback = "") => {
  const direct = process.env[name];
  const filePath = String(process.env[`${name}_FILE`] || "").trim();
  if (direct && filePath) throw new Error(`${name} dan ${name}_FILE tidak boleh dipakai bersamaan`);
  if (!filePath) return direct ?? fallback;
  try {
    const value = fs.readFileSync(filePath, "utf8").replace(/[\r\n]+$/, "");
    if (!value || value.includes("\0")) throw new Error("invalid_secret_file");
    return value;
  } catch {
    throw new Error(`${name}_FILE tidak dapat dibaca atau isinya tidak valid`);
  }
};

const looksLikePlaceholder = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return !normalized || normalized.length < 32 ||
    /^(ganti-|change-|replace-|your-|example-|contoh-|sipadi-dev)/.test(normalized);
};

const isAes256Key = (value) => {
  const source = String(value || "").trim();
  if (/^[a-f0-9]{64}$/i.test(source)) return true;
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(source)) return false;
  try {
    return Buffer.from(source, "base64").length === 32;
  } catch {
    return false;
  }
};

const previousKeyEntries = (value) => String(value || "")
  .split(";")
  .map((entry) => entry.trim())
  .filter(Boolean)
  .map((entry) => {
    const separator = entry.indexOf("=");
    return separator > 0 ? [entry.slice(0, separator), entry.slice(separator + 1)] : [];
  });

const nodeEnv = process.env.NODE_ENV || "development";
const jwtSecret = secretFromEnv("JWT_SECRET", "sipadi-dev-secret-change-me");
const databaseUrl = secretFromEnv("DATABASE_URL", "postgresql://sipadi:sipadi123@localhost:5432/sipadi");
const mfaEncryptionKey = secretFromEnv("MFA_ENCRYPTION_KEY");
const mfaPreviousEncryptionKeys = secretFromEnv("MFA_PREVIOUS_ENCRYPTION_KEYS");
const recoveryCodePepper = secretFromEnv("RECOVERY_CODE_PEPPER");
const backupEncryptionKey = secretFromEnv("BACKUP_ENCRYPTION_KEY");
const backupPreviousEncryptionKeys = secretFromEnv("BACKUP_PREVIOUS_ENCRYPTION_KEYS");
const auditSigningKey = secretFromEnv("AUDIT_SIGNING_KEY", nodeEnv === "production" ? "" : jwtSecret);
const metricsToken = secretFromEnv("METRICS_TOKEN");
const databaseSslMode = enumFromEnv(
  process.env.DATABASE_SSL_MODE,
  nodeEnv === "production" ? "verify-full" : "disable",
  ["disable", "require", "verify-full"]
);
const frontendUrls = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const mfaRequiredRoles = (process.env.MFA_REQUIRED_ROLES || (nodeEnv === "production" ? "Admin,Inspektur" : ""))
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const passkeyRequiredRoles = (process.env.PASSKEY_REQUIRED_ROLES || (nodeEnv === "production" ? "Admin,Inspektur" : ""))
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const webauthnOrigins = (process.env.WEBAUTHN_ORIGINS || frontendUrls.join(","))
  .split(",")
  .map((value) => value.trim().replace(/\/$/, ""))
  .filter(Boolean);
const defaultRpId = (() => {
  try {
    return new URL(webauthnOrigins[0] || frontendUrls[0]).hostname;
  } catch {
    return "localhost";
  }
})();
const webauthnRpId = process.env.WEBAUTHN_RP_ID || defaultRpId;
const auditSigningKeyId = process.env.AUDIT_SIGNING_KEY_ID || "audit-v1";
const auditPreviousSigningKeys = secretFromEnv("AUDIT_PREVIOUS_SIGNING_KEYS") ||
  (nodeEnv === "production" ? "" : "audit-v1=sipadi-dev-secret-change-me");
const fileEncryptionKey = secretFromEnv("FILE_ENCRYPTION_KEY");
const filePreviousEncryptionKeys = secretFromEnv("FILE_PREVIOUS_ENCRYPTION_KEYS");
const fileEncryptionRequired = booleanFromEnv(process.env.FILE_ENCRYPTION_REQUIRED, nodeEnv === "production");
const allowPlaintextStoredFiles = booleanFromEnv(process.env.ALLOW_PLAINTEXT_STORED_FILES, nodeEnv !== "production");
const securityStateRequired = booleanFromEnv(process.env.SECURITY_STATE_REQUIRED, nodeEnv === "production");
const securityStateRedisUrl = String(secretFromEnv("SECURITY_STATE_REDIS_URL") || "").trim();
const fileStorageDriver = enumFromEnv(
  process.env.FILE_STORAGE_DRIVER,
  nodeEnv === "production" ? "s3" : "local",
  ["local", "s3"]
);
const fileS3Bucket = String(process.env.FILE_S3_BUCKET || "").trim();
const fileS3KmsKeyId = String(process.env.FILE_S3_KMS_KEY_ID || "").trim();
const fileStorageVerifyBucketControls = booleanFromEnv(
  process.env.FILE_STORAGE_VERIFY_BUCKET_CONTROLS,
  nodeEnv === "production"
);

if (nodeEnv === "production") {
  let productionDatabasePassword = "";
  try {
    const parsedDatabaseUrl = new URL(databaseUrl);
    if (!["postgres:", "postgresql:"].includes(parsedDatabaseUrl.protocol) || !parsedDatabaseUrl.hostname) {
      throw new Error("invalid_database_url");
    }
    productionDatabasePassword = decodeURIComponent(parsedDatabaseUrl.password);
  } catch {
    throw new Error("DATABASE_URL produksi wajib berupa URL PostgreSQL yang valid");
  }
  if ((!process.env.DATABASE_URL && !process.env.DATABASE_URL_FILE) || looksLikePlaceholder(productionDatabasePassword)) {
    throw new Error("DATABASE_URL produksi wajib diisi dan tidak boleh memakai kredensial development");
  }

  const requiredSecrets = [
    ["DATABASE_PASSWORD", productionDatabasePassword],
    ["JWT_SECRET", jwtSecret],
    ["MFA_ENCRYPTION_KEY", mfaEncryptionKey],
    ["RECOVERY_CODE_PEPPER", recoveryCodePepper],
    ["BACKUP_ENCRYPTION_KEY", backupEncryptionKey],
    ["FILE_ENCRYPTION_KEY", fileEncryptionKey],
    ["AUDIT_SIGNING_KEY", auditSigningKey]
  ];
  if ((process.env.METRICS_ENABLED || "true").toLowerCase() !== "false") {
    requiredSecrets.push(["METRICS_TOKEN", metricsToken]);
  }
  const usedSecrets = new Map();
  for (const [name, value] of requiredSecrets) {
    if (looksLikePlaceholder(value)) {
      throw new Error(`${name} produksi wajib diisi dengan secret acak minimal 32 karakter, bukan placeholder`);
    }
    if (usedSecrets.has(value)) {
      throw new Error(`${name} produksi wajib berbeda dari ${usedSecrets.get(value)}`);
    }
    usedSecrets.set(value, name);
  }
  for (const [name, key] of [["MFA_ENCRYPTION_KEY", mfaEncryptionKey], ["BACKUP_ENCRYPTION_KEY", backupEncryptionKey], ["FILE_ENCRYPTION_KEY", fileEncryptionKey]]) {
    if (!isAes256Key(key)) {
      throw new Error(`${name} produksi wajib berupa tepat 32 byte base64 atau 64 karakter hex`);
    }
  }
  for (const [name, currentId, rawPrevious] of [
    ["MFA_ENCRYPTION_KEY", process.env.MFA_ENCRYPTION_KEY_ID || "mfa-v1", mfaPreviousEncryptionKeys],
    ["BACKUP_ENCRYPTION_KEY", process.env.BACKUP_ENCRYPTION_KEY_ID || "backup-v1", backupPreviousEncryptionKeys],
    ["FILE_ENCRYPTION_KEY", process.env.FILE_ENCRYPTION_KEY_ID || "file-v1", filePreviousEncryptionKeys]
  ]) {
    if (!/^[A-Za-z0-9._-]{1,80}$/.test(currentId)) throw new Error(`${name}_ID tidak valid`);
    const entries = previousKeyEntries(rawPrevious);
    if (entries.some((entry) => entry.length !== 2 || !/^[A-Za-z0-9._-]{1,80}$/.test(entry[0]) || !isAes256Key(entry[1]))) {
      throw new Error(`${name} previous keys wajib berformat key-id=key-aes-256 dan dipisahkan titik koma`);
    }
    const ids = entries.map(([id]) => id);
    if (ids.includes(currentId) || new Set(ids).size !== ids.length) {
      throw new Error(`${name}_ID wajib unik dan berbeda dari seluruh key ID sebelumnya`);
    }
  }
  if (!fileEncryptionRequired || allowPlaintextStoredFiles) {
    throw new Error("Production wajib mengaktifkan FILE_ENCRYPTION_REQUIRED dan menonaktifkan ALLOW_PLAINTEXT_STORED_FILES");
  }

  if (!securityStateRequired) {
    throw new Error("SECURITY_STATE_REQUIRED wajib aktif di production agar rate limit dan blokir terdistribusi");
  }
  try {
    const parsedRedisUrl = new URL(securityStateRedisUrl);
    if (!["redis:", "rediss:"].includes(parsedRedisUrl.protocol) || !parsedRedisUrl.hostname) {
      throw new Error("invalid_redis_url");
    }
    const redisPassword = decodeURIComponent(parsedRedisUrl.password || "");
    if (looksLikePlaceholder(redisPassword)) {
      throw new Error("weak_redis_password");
    }
  } catch {
    throw new Error("SECURITY_STATE_REDIS_URL production wajib berupa redis:// atau rediss:// dengan password acak minimal 32 karakter");
  }

  if (fileStorageDriver !== "s3") {
    throw new Error("FILE_STORAGE_DRIVER production wajib s3 untuk object storage privat");
  }
  if (!fileS3Bucket || /(?:example|contoh|ganti)/i.test(fileS3Bucket)) {
    throw new Error("FILE_S3_BUCKET production wajib menunjuk bucket final milik instansi");
  }
  if (!fileS3KmsKeyId || /(?:example|contoh|ganti)/i.test(fileS3KmsKeyId)) {
    throw new Error("FILE_S3_KMS_KEY_ID production wajib menunjuk kunci KMS final");
  }
  if (!fileStorageVerifyBucketControls) {
    throw new Error("FILE_STORAGE_VERIFY_BUCKET_CONTROLS wajib aktif di production");
  }

  if (!webauthnOrigins.length || webauthnOrigins.some((origin) => !origin.startsWith("https://"))) {
    throw new Error("WEBAUTHN_ORIGINS produksi wajib menggunakan origin HTTPS yang eksplisit");
  }
  if (frontendUrls.some((origin) => !origin.startsWith("https://"))) {
    throw new Error("FRONTEND_URL produksi wajib menggunakan origin HTTPS yang eksplisit");
  }
  for (const origin of webauthnOrigins) {
    const hostname = new URL(origin).hostname;
    if (hostname !== webauthnRpId && !hostname.endsWith(`.${webauthnRpId}`)) {
      throw new Error("WEBAUTHN_RP_ID wajib sama dengan atau menjadi suffix domain WEBAUTHN_ORIGINS");
    }
  }
  const previousAuditKeyIds = auditPreviousSigningKeys
    .split(";")
    .map((entry) => entry.slice(0, entry.indexOf("=")))
    .filter(Boolean);
  if (previousAuditKeyIds.includes(auditSigningKeyId)) {
    throw new Error("AUDIT_SIGNING_KEY_ID produksi wajib berbeda dari seluruh key ID sebelumnya");
  }
}

export const env = {
  nodeEnv,
  port: boundedNumberFromEnv(process.env.PORT, 4000, 1, 65535),
  databaseUrl,
  databaseSslMode,
  databaseSslCaBase64: process.env.DATABASE_SSL_CA_BASE64 || "",
  databasePoolMax: boundedNumberFromEnv(process.env.DATABASE_POOL_MAX, 20, 2, 100),
  databaseIdleTimeoutMs: boundedNumberFromEnv(process.env.DATABASE_IDLE_TIMEOUT_MS, 30000, 1000, 300000),
  databaseConnectionTimeoutMs: boundedNumberFromEnv(process.env.DATABASE_CONNECTION_TIMEOUT_MS, 5000, 1000, 60000),
  databaseStatementTimeoutMs: boundedNumberFromEnv(process.env.DATABASE_STATEMENT_TIMEOUT_MS, 15000, 1000, 120000),
  databaseQueryTimeoutMs: boundedNumberFromEnv(process.env.DATABASE_QUERY_TIMEOUT_MS, 20000, 1000, 180000),
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  jwtIssuer: process.env.JWT_ISSUER || "sipadi-api",
  jwtAudience: process.env.JWT_AUDIENCE || "sipadi-web",
  sessionCookieMaxAgeSeconds: boundedNumberFromEnv(process.env.SESSION_COOKIE_HOURS, 8, 1, 24) * 60 * 60,
  sessionIdleTimeoutSeconds: boundedNumberFromEnv(process.env.SESSION_IDLE_TIMEOUT_MINUTES, 30, 5, 120) * 60,
  maxActiveSessions: boundedNumberFromEnv(process.env.MAX_ACTIVE_SESSIONS, 3, 1, 10),
  frontendUrl: frontendUrls[0],
  frontendUrls,
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  maxFileSizeMb: boundedNumberFromEnv(process.env.MAX_FILE_SIZE_MB, 10, 1, 50),
  maxImportFileSizeMb: boundedNumberFromEnv(process.env.MAX_IMPORT_FILE_SIZE_MB, 2, 1, 10),
  requestBodyLimitBytes: boundedNumberFromEnv(process.env.REQUEST_BODY_LIMIT_BYTES, 262144, 16384, 2097152),
  bcryptRounds: boundedNumberFromEnv(process.env.BCRYPT_ROUNDS, 12, 10, 14),
  trustProxy: boundedNumberFromEnv(process.env.TRUST_PROXY_HOPS, 0, 0, 3),
  securityBlockThreshold: boundedNumberFromEnv(process.env.SECURITY_BLOCK_THRESHOLD, 5, 2, 50),
  securityStrikeWindowMs: boundedNumberFromEnv(process.env.SECURITY_STRIKE_WINDOW_MINUTES, 15, 1, 1440) * 60 * 1000,
  securityBlockDurationMs: boundedNumberFromEnv(process.env.SECURITY_BLOCK_DURATION_MINUTES, 60, 1, 10080) * 60 * 1000,
  securityStateRequired,
  securityStateRedisUrl,
  securityStateKeyPrefix: String(process.env.SECURITY_STATE_KEY_PREFIX || "sipadi:security").replace(/[^A-Za-z0-9:_-]/g, "").slice(0, 80) || "sipadi:security",
  accountLockThreshold: boundedNumberFromEnv(process.env.ACCOUNT_LOCK_THRESHOLD, 10, 5, 50),
  accountLockWindowMs: boundedNumberFromEnv(process.env.ACCOUNT_LOCK_WINDOW_MINUTES, 15, 5, 1440) * 60 * 1000,
  accountLockDurationMs: boundedNumberFromEnv(process.env.ACCOUNT_LOCK_DURATION_MINUTES, 15, 5, 1440) * 60 * 1000,
  passwordHistoryCount: boundedNumberFromEnv(process.env.PASSWORD_HISTORY_COUNT, 5, 1, 12),
  privilegedReauthMaxAgeSeconds: boundedNumberFromEnv(process.env.PRIVILEGED_REAUTH_MAX_AGE_MINUTES, 15, 5, 60) * 60,
  criticalApprovalTtlMinutes: boundedNumberFromEnv(process.env.CRITICAL_APPROVAL_TTL_MINUTES, 30, 5, 120),
  dataEgressWindowMinutes: boundedNumberFromEnv(process.env.DATA_EGRESS_WINDOW_MINUTES, 15, 5, 60),
  dataEgressAlertThreshold: boundedNumberFromEnv(process.env.DATA_EGRESS_ALERT_THRESHOLD, 20, 5, 500),
  dataEgressBlockThreshold: boundedNumberFromEnv(process.env.DATA_EGRESS_BLOCK_THRESHOLD, 40, 10, 1000),
  dataEgressBlockMinutes: boundedNumberFromEnv(process.env.DATA_EGRESS_BLOCK_MINUTES, 60, 5, 1440),
  clamavHost: (process.env.CLAMAV_HOST || "").trim(),
  clamavPort: boundedNumberFromEnv(process.env.CLAMAV_PORT, 3310, 1, 65535),
  clamavTimeoutMs: boundedNumberFromEnv(process.env.CLAMAV_TIMEOUT_MS, 30000, 1000, 120000),
  clamavRequired: booleanFromEnv(process.env.CLAMAV_REQUIRED, nodeEnv === "production"),
  mfaEncryptionKey,
  mfaEncryptionKeyId: process.env.MFA_ENCRYPTION_KEY_ID || "mfa-v1",
  mfaPreviousEncryptionKeys,
  recoveryCodePepper,
  mfaRequiredRoles,
  mfaChallengeTtlMs: boundedNumberFromEnv(process.env.MFA_CHALLENGE_TTL_MINUTES, 5, 2, 15) * 60 * 1000,
  mfaSetupTtlMs: boundedNumberFromEnv(process.env.MFA_SETUP_TTL_MINUTES, 10, 5, 30) * 60 * 1000,
  passkeyRequiredRoles,
  webauthnRpId,
  webauthnRpName: process.env.WEBAUTHN_RP_NAME || "SIPADI Inspektorat Kota Depok",
  webauthnOrigins,
  webauthnChallengeTtlMs: boundedNumberFromEnv(process.env.WEBAUTHN_CHALLENGE_TTL_MINUTES, 5, 2, 15) * 60 * 1000,
  auditSigningKey,
  auditSigningKeyId,
  auditPreviousSigningKeys,
  metricsEnabled: booleanFromEnv(process.env.METRICS_ENABLED, true),
  metricsToken,
  backupEncryptionKey,
  backupEncryptionKeyId: process.env.BACKUP_ENCRYPTION_KEY_ID || "backup-v1",
  backupPreviousEncryptionKeys,
  fileEncryptionKey,
  fileEncryptionKeyId: process.env.FILE_ENCRYPTION_KEY_ID || "file-v1",
  filePreviousEncryptionKeys,
  fileEncryptionRequired,
  allowPlaintextStoredFiles,
  fileStorageDriver,
  fileS3Bucket,
  fileS3Region: String(process.env.FILE_S3_REGION || "ap-southeast-1").trim(),
  fileS3Prefix: String(process.env.FILE_S3_PREFIX || "sipadi/files").replace(/^\/+|\/+$/g, ""),
  fileS3Endpoint: String(process.env.FILE_S3_ENDPOINT || "").trim(),
  fileS3ForcePathStyle: booleanFromEnv(process.env.FILE_S3_FORCE_PATH_STYLE, false),
  fileS3KmsKeyId,
  fileStorageVerifyBucketControls,
  allowPlaintextBackupRestore: booleanFromEnv(process.env.ALLOW_PLAINTEXT_BACKUP_RESTORE, nodeEnv !== "production"),
  maxBackupFileSizeMb: boundedNumberFromEnv(process.env.MAX_BACKUP_FILE_SIZE_MB, 100, 10, 500),
  schedulerTimezone: process.env.SCHEDULER_TIMEZONE || "Asia/Jakarta",
  schedulerRunHour: boundedNumberFromEnv(process.env.SCHEDULER_RUN_HOUR, 7, 0, 23),
  schedulerRunMinute: boundedNumberFromEnv(process.env.SCHEDULER_RUN_MINUTE, 0, 0, 59)
};
