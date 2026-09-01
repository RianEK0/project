import { randomBytes } from "node:crypto";

function secret(bytes = 32) {
  return randomBytes(bytes).toString("base64");
}

console.log([
  "# Salin hanya ke secret manager atau file environment berizin 0600.",
  `JWT_SECRET=${secret(48)}`,
  `MFA_ENCRYPTION_KEY=${secret()}`,
  "MFA_ENCRYPTION_KEY_ID=mfa-v1",
  `RECOVERY_CODE_PEPPER=${secret(48)}`,
  `AUDIT_SIGNING_KEY=${secret(48)}`,
  "AUDIT_SIGNING_KEY_ID=audit-v1",
  `METRICS_TOKEN=${secret(48)}`,
  `BACKUP_ENCRYPTION_KEY=${secret()}`,
  "BACKUP_ENCRYPTION_KEY_ID=backup-v1",
  `FILE_ENCRYPTION_KEY=${secret()}`,
  "FILE_ENCRYPTION_KEY_ID=file-v1"
].join("\n"));
