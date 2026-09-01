import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const envPath = path.resolve(process.cwd(), process.env.ENV_FILE || ".env");
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

const failures = [];
const value = (name) => {
  const direct = process.env[name];
  const filePath = String(process.env[`${name}_FILE`] || "").trim();
  if (direct && filePath) {
    failures.push(`${name}: nilai langsung dan ${name}_FILE tidak boleh dipakai bersamaan`);
    return "";
  }
  if (!filePath) return String(direct || "").trim();
  try {
    return fs.readFileSync(filePath, "utf8").replace(/[\r\n]+$/, "").trim();
  } catch {
    failures.push(`${name}_FILE: file secret tidak dapat dibaca`);
    return "";
  }
};
const requireValue = (name, predicate, message) => {
  if (!predicate(value(name))) failures.push(`${name}: ${message}`);
};
const strongSecret = (secret) => secret.length >= 32 && !/(ganti|change|example|password|secret-?produksi)/i.test(secret);
const aes256Key = (secret) => {
  if (/^[a-f0-9]{64}$/i.test(secret)) return true;
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(secret)) return false;
  try { return Buffer.from(secret, "base64").length === 32; } catch { return false; }
};

requireValue("NODE_ENV", (item) => item === "production", "wajib bernilai production");
requireValue("APP_ORIGIN", (item) => {
  try { return new URL(item).protocol === "https:"; } catch { return false; }
}, "wajib berupa origin HTTPS valid");
requireValue("SERVER_NAME", (item) => item && !/(localhost|example\.)/i.test(item), "wajib domain production final");
requireValue("POLICY_APPROVED", (item) => item === "true", "kebijakan publik belum ditandai telah disahkan");
requireValue("SECURITY_CONTACT", (item) => /^(?:mailto:|https:\/\/)/i.test(item), "wajib URI mailto: atau HTTPS aktif");
requireValue("WEBAUTHN_RP_ID", (item) => item && !/(localhost|example\.)/i.test(item), "wajib RP ID production final");
requireValue("WEBAUTHN_ORIGINS", (item) => item.split(",").every((origin) => origin.trim().startsWith("https://")), "seluruh origin wajib HTTPS");
requireValue("MFA_REQUIRED_ROLES", (item) => ["Admin", "Inspektur"].every((role) => item.split(",").map((part) => part.trim()).includes(role)), "minimal Admin dan Inspektur wajib MFA");
requireValue("PASSKEY_REQUIRED_ROLES", (item) => ["Admin", "Inspektur"].every((role) => item.split(",").map((part) => part.trim()).includes(role)), "minimal Admin dan Inspektur wajib passkey");
requireValue("TLS_REDIRECT", (item) => item === "on", "redirect TLS wajib aktif");
requireValue("BACKUP_S3_BUCKET", (item) => item && !/example/i.test(item), "bucket backup offsite final wajib diisi");
requireValue("BACKUP_S3_OBJECT_LOCK_DAYS", (item) => Number.isInteger(Number(item)) && Number(item) > 0, "retensi immutable/Object Lock wajib lebih dari 0 hari");
requireValue("SECURITY_STATE_REQUIRED", (item) => item === "true", "state rate limit/blokir terdistribusi wajib aktif");
requireValue("SECURITY_STATE_REDIS_URL", (item) => {
  try {
    const parsed = new URL(item);
    return ["redis:", "rediss:"].includes(parsed.protocol) && parsed.hostname && strongSecret(decodeURIComponent(parsed.password));
  } catch { return false; }
}, "wajib URL Redis/Valkey berautentikasi untuk state keamanan terdistribusi");
requireValue("FILE_STORAGE_DRIVER", (item) => item === "s3", "production wajib memakai object storage S3-compatible privat");
requireValue("FILE_S3_BUCKET", (item) => item && !/(example|contoh|ganti)/i.test(item), "bucket dokumen final wajib diisi");
requireValue("FILE_S3_KMS_KEY_ID", (item) => item.length >= 20 && !/(example|contoh|ganti)/i.test(item), "kunci KMS final wajib diisi");
requireValue("FILE_STORAGE_VERIFY_BUCKET_CONTROLS", (item) => item === "true", "verifikasi versioning, public-access block, dan KMS wajib aktif");
if (value("DATABASE_URL")) {
  requireValue("DATABASE_URL", (item) => {
    try {
      const parsed = new URL(item);
      return ["postgres:", "postgresql:"].includes(parsed.protocol) && parsed.hostname &&
        strongSecret(decodeURIComponent(parsed.password));
    } catch {
      return false;
    }
  }, "wajib URL PostgreSQL production tanpa kredensial development");
} else {
  requireValue("POSTGRES_DB", (item) => item.length >= 1, "wajib diisi saat DATABASE_URL dibentuk oleh Compose");
  requireValue("POSTGRES_USER", (item) => item.length >= 1, "wajib diisi saat DATABASE_URL dibentuk oleh Compose");
}
requireValue("DATABASE_SSL_MODE", (item) => ["disable", "verify-full"].includes(item), "go-live hanya menerima verify-full atau disable untuk private network yang disetujui");
if (value("DATABASE_SSL_MODE") === "disable" && value("DATABASE_PRIVATE_NETWORK_ACKNOWLEDGED") !== "true") {
  failures.push("DATABASE_PRIVATE_NETWORK_ACKNOWLEDGED: wajib true bila TLS database dimatikan pada jaringan privat tersegmentasi");
}
requireValue("SESSION_COOKIE_HOURS", (item) => Number.isInteger(Number(item)) && Number(item) >= 1 && Number(item) <= 24, "wajib 1-24 jam");
requireValue("SESSION_IDLE_TIMEOUT_MINUTES", (item) => Number.isInteger(Number(item)) && Number(item) >= 5 && Number(item) <= 60, "wajib 5-60 menit untuk baseline AAL2");
requireValue("MAX_ACTIVE_SESSIONS", (item) => Number.isInteger(Number(item)) && Number(item) >= 1 && Number(item) <= 5, "wajib 1-5 sesi aktif");

const secretNames = [
  "POSTGRES_PASSWORD",
  "JWT_SECRET",
  "MFA_ENCRYPTION_KEY",
  "RECOVERY_CODE_PEPPER",
  "AUDIT_SIGNING_KEY",
  "METRICS_TOKEN",
  "BACKUP_ENCRYPTION_KEY",
  "FILE_ENCRYPTION_KEY"
];
for (const name of secretNames) requireValue(name, strongSecret, "wajib secret unik, acak, minimal 32 karakter, dan bukan placeholder");
if (value("SECURITY_STATE_REDIS_PASSWORD")) {
  requireValue("SECURITY_STATE_REDIS_PASSWORD", strongSecret, "wajib acak minimal 32 karakter dan bukan placeholder");
}
for (const name of ["MFA_ENCRYPTION_KEY", "BACKUP_ENCRYPTION_KEY", "FILE_ENCRYPTION_KEY"]) {
  requireValue(name, aes256Key, "wajib tepat 32 byte dalam format base64 atau 64 karakter hex");
}
const secrets = secretNames.map((name) => value(name)).filter(Boolean);
if (new Set(secrets).size !== secrets.length) failures.push("SECRET_UNIQUENESS: setiap fungsi wajib memakai secret yang berbeda");
requireValue("FILE_ENCRYPTION_REQUIRED", (item) => item === "true", "enkripsi berkas saat tersimpan wajib aktif");
requireValue("ALLOW_PLAINTEXT_STORED_FILES", (item) => item === "false", "akses berkas plaintext wajib dimatikan setelah migrasi");

for (const evidenceFlag of [
  "WAF_PRODUCTION_VERIFIED",
  "ORIGIN_LOCKDOWN_VERIFIED",
  "SIEM_ALERT_VERIFIED",
  "EDR_COVERAGE_VERIFIED",
  "COSIGN_IMAGES_VERIFIED",
  "RESTORE_DRILL_PASSED",
  "INCIDENT_TABLETOP_PASSED"
]) {
  requireValue(evidenceFlag, (item) => item === "true", "bukti production wajib diverifikasi dan disetujui");
}
requireValue("PASSKEY_PRIVILEGED_OFFICERS", (item) => Number.isInteger(Number(item)) && Number(item) >= 2, "minimal dua pejabat istimewa wajib memiliki passkey");
requireValue("VAPT_HIGH_CRITICAL_OPEN", (item) => Number(item) === 0, "tidak boleh ada temuan Critical/High terbuka");
requireValue("VAPT_REPORT_SHA256", (item) => /^[a-f0-9]{64}$/i.test(item), "checksum SHA-256 laporan VAPT final wajib diisi");
requireValue("RESTORE_DRILL_EVIDENCE_ID", (item) => item.length >= 8 && !/(isi|example|contoh|ganti)/i.test(item), "ID bukti restore drill wajib diisi");

try {
  const origin = new URL(value("APP_ORIGIN"));
  const rpId = value("WEBAUTHN_RP_ID");
  if (rpId && origin.hostname !== rpId && !origin.hostname.endsWith(`.${rpId}`)) {
    failures.push("WEBAUTHN_RP_ID: bukan registrable suffix dari hostname APP_ORIGIN");
  }
} catch {
  // Kesalahan APP_ORIGIN sudah dicatat di atas.
}

if (failures.length) {
  console.error("GO-LIVE PREFLIGHT: GAGAL\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("GO-LIVE PREFLIGHT: LULUS untuk pemeriksaan environment statis.");
console.log("Tetap wajib melampirkan VAPT, restore drill, SIEM/WAF/IAP test, kajian hukum, dan persetujuan go-live.");
