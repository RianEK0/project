import test from "node:test";
import assert from "node:assert/strict";
import * as OTPAuth from "otpauth";
import { env } from "../src/config/env.js";
import { decryptEnvelope, encryptEnvelope, parseEncryptionKey } from "../src/services/cryptoEnvelope.js";
import { decryptBackupPayload, encryptBackupPayload } from "../src/services/backupEncryption.js";
import { decryptStoredBuffer, encryptStoredBuffer, isEncryptedStoredFile } from "../src/services/storedFileEncryption.js";
import {
  decryptMfaSecret,
  encryptMfaSecret,
  generateRecoveryCodes,
  normalizeRecoveryCode,
  verifyTotp
} from "../src/services/mfa.js";

const key = Buffer.alloc(32, 7).toString("base64");
env.backupEncryptionKey = key;
env.mfaEncryptionKey = Buffer.alloc(32, 9).toString("base64");
env.recoveryCodePepper = "pepper-pengujian-yang-panjang-dan-berbeda-123";
env.fileEncryptionKey = Buffer.alloc(32, 11).toString("base64");
env.fileEncryptionKeyId = "file-test-v1";

test("AES-GCM menolak ciphertext yang dimodifikasi", () => {
  const parsedKey = parseEncryptionKey(key);
  const encrypted = encryptEnvelope("rahasia", { key: parsedKey, keyId: "test", aad: "context" });
  const tampered = { ...encrypted, ciphertext: `${encrypted.ciphertext.slice(0, -2)}AA` };

  assert.equal(decryptEnvelope(encrypted, { key: parsedKey, aad: "context" }).toString(), "rahasia");
  assert.throws(() => decryptEnvelope(tampered, { key: parsedKey, aad: "context" }), /autentikasi gagal/);
});

test("backup terenkripsi dapat dipulihkan dan menolak manipulasi", () => {
  const original = { app: "SIPADI", version: 1, tables: [], data: {} };
  const encrypted = encryptBackupPayload(original);
  assert.deepEqual(decryptBackupPayload(encrypted).payload, original);

  const container = JSON.parse(encrypted.toString("utf8"));
  container.encryption.authTag = Buffer.alloc(16, 1).toString("base64");
  assert.throws(() => decryptBackupPayload(Buffer.from(JSON.stringify(container))), /autentikasi gagal/);
});

test("berkas tersimpan terenkripsi, terautentikasi, dan menolak plaintext", () => {
  const original = Buffer.from("dokumen rahasia pemerintah");
  const encrypted = encryptStoredBuffer(original);
  assert.equal(isEncryptedStoredFile(encrypted), true);
  assert.notEqual(encrypted.includes(original), true);
  assert.deepEqual(decryptStoredBuffer(encrypted).plaintext, original);

  const tampered = Buffer.from(encrypted);
  tampered[tampered.length - 17] ^= 0xff;
  assert.throws(() => decryptStoredBuffer(tampered), /autentikasi gagal/);
  assert.throws(
    () => decryptStoredBuffer(original, { allowPlaintext: false }),
    /belum terenkripsi/
  );
});

test("secret MFA terenkripsi terikat ke user dan kode TOTP tidak dapat dipakai ulang", () => {
  const secret = new OTPAuth.Secret({ size: 20 }).base32;
  const encrypted = encryptMfaSecret(secret, 41);
  assert.equal(decryptMfaSecret(encrypted, 41), secret);
  assert.throws(() => decryptMfaSecret(encrypted, 42), /autentikasi gagal/);

  const totp = new OTPAuth.TOTP({ algorithm: "SHA1", digits: 6, period: 30, secret: OTPAuth.Secret.fromBase32(secret) });
  const first = verifyTotp(secret, totp.generate());
  assert.equal(first.valid, true);
  assert.equal(verifyTotp(secret, totp.generate(), first.step).reason, "replayed");
});

test("recovery code acak, terformat, dan dapat dinormalisasi", () => {
  const codes = generateRecoveryCodes();
  assert.equal(codes.length, 10);
  assert.equal(new Set(codes).size, 10);
  assert.ok(codes.every((code) => /^[A-F0-9]{4}(?:-[A-F0-9]{4}){4}$/.test(code)));
  assert.equal(normalizeRecoveryCode(codes[0]).length, 20);
});
