import fs from "node:fs";
import { createCipheriv, createDecipheriv, randomBytes, randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { parseEncryptionKey, selectEncryptionKey } from "./cryptoEnvelope.js";
import { recordSecurityEvent } from "./securityEvents.js";

const MAGIC = Buffer.from("SIPADI01", "ascii");
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_ID_LENGTH_BYTES = 2;
const MIN_CONTAINER_LENGTH = MAGIC.length + KEY_ID_LENGTH_BYTES + IV_LENGTH + AUTH_TAG_LENGTH;

function currentKey() {
  return parseEncryptionKey(env.fileEncryptionKey, "FILE_ENCRYPTION_KEY");
}

function containerHeader(keyId, iv) {
  const keyIdBuffer = Buffer.from(String(keyId || "file-v1"), "utf8");
  if (keyIdBuffer.length > 65535) {
    throw new Error("FILE_ENCRYPTION_KEY_ID terlalu panjang");
  }
  const keyIdLength = Buffer.alloc(KEY_ID_LENGTH_BYTES);
  keyIdLength.writeUInt16BE(keyIdBuffer.length);
  return Buffer.concat([MAGIC, keyIdLength, keyIdBuffer, iv]);
}

export function isEncryptedStoredFile(buffer) {
  return Buffer.isBuffer(buffer) && buffer.length >= MAGIC.length && buffer.subarray(0, MAGIC.length).equals(MAGIC);
}

export function encryptStoredBuffer(input) {
  if (!env.fileEncryptionKey) {
    if (env.fileEncryptionRequired) {
      throw new Error("FILE_ENCRYPTION_KEY wajib tersedia untuk menyimpan berkas");
    }
    return Buffer.isBuffer(input) ? input : Buffer.from(input);
  }

  const plaintext = Buffer.isBuffer(input) ? input : Buffer.from(input);
  const iv = randomBytes(IV_LENGTH);
  const header = containerHeader(env.fileEncryptionKeyId, iv);
  const cipher = createCipheriv(ALGORITHM, currentKey(), iv, { authTagLength: AUTH_TAG_LENGTH });
  cipher.setAAD(header);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([header, ciphertext, cipher.getAuthTag()]);
}

export function decryptStoredBuffer(input, { allowPlaintext = env.allowPlaintextStoredFiles } = {}) {
  const container = Buffer.isBuffer(input) ? input : Buffer.from(input);
  if (!isEncryptedStoredFile(container)) {
    if (allowPlaintext) return { plaintext: container, encrypted: false, keyId: null };
    const error = new Error("Berkas lama belum terenkripsi dan akses plaintext dinonaktifkan");
    error.code = "PLAINTEXT_STORED_FILE_BLOCKED";
    throw error;
  }
  if (container.length < MIN_CONTAINER_LENGTH) {
    throw new Error("Format berkas terenkripsi tidak lengkap");
  }

  const keyIdLength = container.readUInt16BE(MAGIC.length);
  const keyIdStart = MAGIC.length + KEY_ID_LENGTH_BYTES;
  const ivStart = keyIdStart + keyIdLength;
  const ciphertextStart = ivStart + IV_LENGTH;
  const authTagStart = container.length - AUTH_TAG_LENGTH;
  if (keyIdLength < 1 || ciphertextStart > authTagStart) {
    throw new Error("Format berkas terenkripsi tidak valid");
  }

  const keyId = container.subarray(keyIdStart, ivStart).toString("utf8");
  const header = container.subarray(0, ciphertextStart);
  const iv = container.subarray(ivStart, ciphertextStart);
  const ciphertext = container.subarray(ciphertextStart, authTagStart);
  const authTag = container.subarray(authTagStart);

  try {
    const key = selectEncryptionKey({ keyId }, {
      currentKey: env.fileEncryptionKey,
      currentKeyId: env.fileEncryptionKeyId,
      previousKeys: env.filePreviousEncryptionKeys,
      name: "FILE_ENCRYPTION_KEY"
    });
    const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAAD(header);
    decipher.setAuthTag(authTag);
    return {
      plaintext: Buffer.concat([decipher.update(ciphertext), decipher.final()]),
      encrypted: true,
      keyId
    };
  } catch (cause) {
    const error = new Error("Berkas terenkripsi rusak, kunci salah, atau autentikasi gagal");
    error.code = "STORED_FILE_AUTH_FAILED";
    error.cause = cause;
    throw error;
  }
}

export async function encryptStoredFile(filePath, { force = false } = {}) {
  const source = await fs.promises.readFile(filePath);
  if (isEncryptedStoredFile(source) && !force) {
    const verified = decryptStoredBuffer(source, { allowPlaintext: false });
    return { encrypted: true, alreadyEncrypted: true, keyId: verified.keyId };
  }
  if (!env.fileEncryptionKey && !env.fileEncryptionRequired) {
    return { encrypted: false, alreadyEncrypted: false, keyId: null };
  }

  const plaintext = isEncryptedStoredFile(source)
    ? decryptStoredBuffer(source, { allowPlaintext: false }).plaintext
    : source;
  const encrypted = encryptStoredBuffer(plaintext);
  const temporaryPath = `${filePath}.${randomUUID()}.encrypting`;
  try {
    await fs.promises.writeFile(temporaryPath, encrypted, { mode: 0o600, flag: "wx" });
    await fs.promises.rename(temporaryPath, filePath);
    await fs.promises.chmod(filePath, 0o600);
  } catch (error) {
    await fs.promises.unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
  return { encrypted: true, alreadyEncrypted: false, keyId: env.fileEncryptionKeyId };
}

export async function readStoredFile(filePath, options) {
  const stat = await fs.promises.stat(filePath);
  if (stat.size > (env.maxFileSizeMb * 1024 * 1024) + 65536) {
    const error = new Error("Ukuran berkas tersimpan melampaui batas konfigurasi");
    error.code = "STORED_FILE_TOO_LARGE";
    throw error;
  }
  const input = await fs.promises.readFile(filePath);
  return decryptStoredBuffer(input, options);
}

export async function sendStoredFile(res, filePath, {
  filename,
  disposition = "attachment",
  contentType = "application/octet-stream",
  req
} = {}) {
  let storedFile;
  try {
    storedFile = await readStoredFile(filePath);
  } catch (error) {
    await recordSecurityEvent({
      type: error.code === "PLAINTEXT_STORED_FILE_BLOCKED" ? "PLAINTEXT_STORED_FILE_BLOCKED" : "STORED_FILE_INTEGRITY_FAILED",
      severity: error.code === "PLAINTEXT_STORED_FILE_BLOCKED" ? "high" : "critical",
      req,
      metadata: { code: error.code || "STORED_FILE_READ_FAILED" }
    });
    throw error;
  }
  const { plaintext, encrypted, keyId } = storedFile;
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", plaintext.length);
  if (disposition === "inline") {
    res.setHeader("Content-Disposition", "inline");
  } else {
    res.attachment(filename || "document");
  }
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.locals.storedFileEncryption = { encrypted, keyId };
  return res.send(plaintext);
}
