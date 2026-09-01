import { env } from "../config/env.js";
import { decryptEnvelope, encryptEnvelope, parseEncryptionKey, selectEncryptionKey } from "./cryptoEnvelope.js";

const BACKUP_AAD = "sipadi:backup:v1";

function backupKey() {
  return parseEncryptionKey(env.backupEncryptionKey, "BACKUP_ENCRYPTION_KEY");
}

export function encryptBackupPayload(payload) {
  const envelope = encryptEnvelope(JSON.stringify(payload), {
    key: backupKey(),
    keyId: env.backupEncryptionKeyId,
    aad: BACKUP_AAD
  });

  return Buffer.from(JSON.stringify({
    app: "SIPADI",
    format: "encrypted-backup",
    version: 1,
    createdAt: new Date().toISOString(),
    encryption: envelope
  }));
}

export function decryptBackupPayload(input) {
  let container;
  try {
    container = JSON.parse(Buffer.isBuffer(input) ? input.toString("utf8") : String(input));
  } catch {
    throw new Error("File backup tidak memiliki format JSON yang valid");
  }

  if (container?.format !== "encrypted-backup") {
    if (env.allowPlaintextBackupRestore && container?.app === "SIPADI") {
      return { payload: container, encrypted: false, keyId: null };
    }
    throw new Error("Backup tidak terenkripsi atau formatnya tidak didukung");
  }

  const plaintext = decryptEnvelope(container.encryption, {
    key: selectEncryptionKey(container.encryption, {
      currentKey: env.backupEncryptionKey,
      currentKeyId: env.backupEncryptionKeyId,
      previousKeys: env.backupPreviousEncryptionKeys,
      name: "BACKUP_ENCRYPTION_KEY"
    }),
    aad: BACKUP_AAD
  });

  let payload;
  try {
    payload = JSON.parse(plaintext.toString("utf8"));
  } catch {
    throw new Error("Isi backup terenkripsi tidak valid");
  }
  return { payload, encrypted: true, keyId: container.encryption?.keyId || null };
}
