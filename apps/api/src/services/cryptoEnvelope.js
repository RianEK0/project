import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const AUTH_TAG_LENGTH = 16;

export function parseEncryptionKey(value, name = "ENCRYPTION_KEY") {
  const source = String(value || "").trim();
  let key;

  if (/^[a-f0-9]{64}$/i.test(source)) {
    key = Buffer.from(source, "hex");
  } else {
    key = Buffer.from(source, "base64");
  }

  if (key.length !== 32) {
    const error = new Error(`${name} harus berupa 32 byte dalam format base64 atau 64 karakter hex`);
    error.code = "INVALID_ENCRYPTION_KEY";
    throw error;
  }
  return key;
}

export function selectEncryptionKey(envelope, { currentKey, currentKeyId, previousKeys = "", name = "ENCRYPTION_KEY" }) {
  if (!envelope?.keyId || envelope.keyId === currentKeyId) {
    return parseEncryptionKey(currentKey, name);
  }

  const match = String(previousKeys)
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const separator = entry.indexOf("=");
      return separator > 0 ? [entry.slice(0, separator), entry.slice(separator + 1)] : [];
    })
    .find(([keyId]) => keyId === envelope.keyId);

  if (!match) {
    const error = new Error(`Kunci ${name} dengan ID ${envelope.keyId} tidak tersedia`);
    error.code = "ENCRYPTION_KEY_NOT_FOUND";
    throw error;
  }
  return parseEncryptionKey(match[1], `${name}[${envelope.keyId}]`);
}

export function encryptEnvelope(value, { key, keyId, aad }) {
  const plaintext = Buffer.isBuffer(value) ? value : Buffer.from(String(value), "utf8");
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  if (aad) cipher.setAAD(Buffer.from(aad, "utf8"));
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  return {
    version: 1,
    algorithm: ALGORITHM,
    keyId,
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    ciphertext: ciphertext.toString("base64")
  };
}

export function decryptEnvelope(envelope, { key, aad }) {
  if (!envelope || envelope.version !== 1 || envelope.algorithm !== ALGORITHM) {
    const error = new Error("Format data terenkripsi tidak didukung");
    error.code = "INVALID_ENCRYPTED_ENVELOPE";
    throw error;
  }

  try {
    const decipher = createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(envelope.iv, "base64"),
      { authTagLength: AUTH_TAG_LENGTH }
    );
    if (aad) decipher.setAAD(Buffer.from(aad, "utf8"));
    decipher.setAuthTag(Buffer.from(envelope.authTag, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(envelope.ciphertext, "base64")),
      decipher.final()
    ]);
  } catch (cause) {
    const error = new Error("Data terenkripsi rusak, kunci salah, atau autentikasi gagal");
    error.code = "ENCRYPTED_DATA_AUTH_FAILED";
    error.cause = cause;
    throw error;
  }
}
