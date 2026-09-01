import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const apiDirectory = fileURLToPath(new URL("..", import.meta.url));
const importScript = `import("./src/config/env.js")
  .then(() => process.exit(0))
  .catch((error) => { console.error(error.message); process.exit(2); });`;

function productionEnvironment(overrides = {}) {
  const aesKey = (byte) => Buffer.alloc(32, byte).toString("base64");
  return {
    ...process.env,
    NODE_ENV: "production",
    DATABASE_URL: `postgresql://sipadi:${"p".repeat(48)}@db.internal:5432/sipadi`,
    DATABASE_SSL_MODE: "disable",
    JWT_SECRET: "j".repeat(48),
    MFA_ENCRYPTION_KEY: aesKey(11),
    RECOVERY_CODE_PEPPER: "r".repeat(48),
    BACKUP_ENCRYPTION_KEY: aesKey(12),
    FILE_ENCRYPTION_KEY: aesKey(13),
    FILE_ENCRYPTION_REQUIRED: "true",
    ALLOW_PLAINTEXT_STORED_FILES: "false",
    AUDIT_SIGNING_KEY: "a".repeat(48),
    AUDIT_SIGNING_KEY_ID: "audit-v2",
    AUDIT_PREVIOUS_SIGNING_KEYS: "",
    METRICS_ENABLED: "false",
    FRONTEND_URL: "https://sipadi.example.go.id",
    WEBAUTHN_ORIGINS: "https://sipadi.example.go.id",
    WEBAUTHN_RP_ID: "sipadi.example.go.id",
    SECURITY_STATE_REQUIRED: "true",
    SECURITY_STATE_REDIS_URL: `redis://:${"s".repeat(48)}@redis.internal:6379/0`,
    FILE_STORAGE_DRIVER: "s3",
    FILE_S3_BUCKET: "sipadi-production-files",
    FILE_S3_REGION: "ap-southeast-1",
    FILE_S3_KMS_KEY_ID: "arn:aws:kms:ap-southeast-1:123456789012:key/11111111-2222-3333-4444-555555555555",
    FILE_STORAGE_VERIFY_BUCKET_CONTROLS: "true",
    ...overrides
  };
}

function loadProductionConfig(overrides) {
  return spawnSync(process.execPath, ["--input-type=module", "-e", importScript], {
    cwd: apiDirectory,
    env: productionEnvironment(overrides),
    encoding: "utf8"
  });
}

test("konfigurasi production menolak secret placeholder", () => {
  const result = loadProductionConfig({
    JWT_SECRET: "ganti-dengan-secret-acak-minimal-32-karakter"
  });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /bukan placeholder/i);
});

test("konfigurasi production menolak penggunaan ulang secret", () => {
  const duplicated = "d".repeat(48);
  const result = loadProductionConfig({
    JWT_SECRET: duplicated,
    BACKUP_ENCRYPTION_KEY: duplicated
  });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /wajib berbeda/i);
});

test("konfigurasi production menolak kredensial database development", () => {
  const result = loadProductionConfig({
    DATABASE_URL: "postgresql://sipadi:sipadi123@localhost:5432/sipadi"
  });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /kredensial development/i);
});

test("konfigurasi production menolak key AES dengan ukuran salah", () => {
  const result = loadProductionConfig({ FILE_ENCRYPTION_KEY: "f".repeat(48) });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /tepat 32 byte/i);
});

test("konfigurasi production menerima secret kuat yang terpisah", () => {
  const result = loadProductionConfig();
  assert.equal(result.status, 0, result.stderr);
});

test("konfigurasi production menolak security state lokal", () => {
  const result = loadProductionConfig({ SECURITY_STATE_REQUIRED: "false" });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /rate limit dan blokir terdistribusi/i);
});

test("konfigurasi production menolak penyimpanan file lokal", () => {
  const result = loadProductionConfig({ FILE_STORAGE_DRIVER: "local" });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /object storage privat/i);
});
