import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import {
  GetBucketEncryptionCommand,
  GetBucketVersioningCommand,
  GetObjectCommand,
  GetPublicAccessBlockCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { env } from "../config/env.js";
import { decryptStoredBuffer } from "./storedFileEncryption.js";
import { recordSecurityEvent } from "./securityEvents.js";

const S3_REFERENCE_PREFIX = "s3:";
const uploadRoot = path.resolve(process.cwd(), env.uploadDir);
let client = null;

function getS3Client() {
  if (!client) {
    client = new S3Client({
      region: env.fileS3Region,
      ...(env.fileS3Endpoint ? { endpoint: env.fileS3Endpoint } : {}),
      forcePathStyle: env.fileS3ForcePathStyle
    });
  }
  return client;
}

function localPath(reference) {
  if (
    typeof reference !== "string" ||
    !reference ||
    reference.includes("/") ||
    reference.includes("\\") ||
    path.basename(reference) !== reference
  ) {
    const error = new Error("Lokasi file arsip tidak valid");
    error.status = 400;
    throw error;
  }
  const resolved = path.resolve(uploadRoot, reference);
  if (path.dirname(resolved) !== uploadRoot) {
    const error = new Error("Lokasi file arsip tidak valid");
    error.status = 400;
    throw error;
  }
  return resolved;
}

function objectKey(reference) {
  if (!String(reference || "").startsWith(S3_REFERENCE_PREFIX)) {
    const error = new Error("Referensi object storage tidak valid");
    error.status = 400;
    throw error;
  }
  const key = reference.slice(S3_REFERENCE_PREFIX.length);
  const allowedPrefix = `${env.fileS3Prefix}/`;
  if (
    !key.startsWith(allowedPrefix) ||
    key.includes("..") ||
    !/^[A-Za-z0-9._/-]{1,900}$/.test(key)
  ) {
    const error = new Error("Referensi object storage berada di luar prefix SIPADI");
    error.status = 400;
    throw error;
  }
  return key;
}

function isMissingObject(error) {
  return error?.name === "NotFound" || error?.$metadata?.httpStatusCode === 404;
}

async function bodyToBuffer(body, maximum) {
  if (!body) throw new Error("Object storage mengembalikan body kosong");
  if (typeof body.transformToByteArray === "function") {
    const value = Buffer.from(await body.transformToByteArray());
    if (value.length > maximum) throw Object.assign(new Error("Ukuran object tersimpan melampaui batas konfigurasi"), { code: "STORED_FILE_TOO_LARGE" });
    return value;
  }
  const chunks = [];
  let total = 0;
  for await (const chunk of body) {
    const value = Buffer.from(chunk);
    total += value.length;
    if (total > maximum) throw Object.assign(new Error("Ukuran object tersimpan melampaui batas konfigurasi"), { code: "STORED_FILE_TOO_LARGE" });
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export function isS3StorageReference(reference) {
  return typeof reference === "string" && reference.startsWith(S3_REFERENCE_PREFIX);
}

export async function initializeFileStorage() {
  if (env.fileStorageDriver === "local") return { driver: "local", verified: true };

  const s3 = getS3Client();
  if (!env.fileStorageVerifyBucketControls) return { driver: "s3", verified: false };

  const [versioning, publicAccess, encryption] = await Promise.all([
    s3.send(new GetBucketVersioningCommand({ Bucket: env.fileS3Bucket })),
    s3.send(new GetPublicAccessBlockCommand({ Bucket: env.fileS3Bucket })),
    s3.send(new GetBucketEncryptionCommand({ Bucket: env.fileS3Bucket }))
  ]);
  if (versioning.Status !== "Enabled") {
    throw new Error("Bucket dokumen wajib mengaktifkan versioning");
  }
  const block = publicAccess.PublicAccessBlockConfiguration || {};
  if (![block.BlockPublicAcls, block.IgnorePublicAcls, block.BlockPublicPolicy, block.RestrictPublicBuckets].every(Boolean)) {
    throw new Error("Bucket dokumen wajib memblokir seluruh akses publik");
  }
  const rules = encryption.ServerSideEncryptionConfiguration?.Rules || [];
  const kmsEnabled = rules.some((rule) => rule.ApplyServerSideEncryptionByDefault?.SSEAlgorithm === "aws:kms");
  if (!kmsEnabled) throw new Error("Bucket dokumen wajib memakai default encryption AWS KMS");
  return { driver: "s3", verified: true };
}

export async function persistEncryptedUpload(file, { removeLocal = true } = {}) {
  if (!file?.path || env.fileStorageDriver === "local") return file;

  const maximum = (env.maxFileSizeMb * 1024 * 1024) + 65536;
  const stat = await fs.promises.stat(file.path);
  if (!stat.isFile() || stat.size > maximum) throw Object.assign(new Error("Ukuran berkas tersimpan melampaui batas konfigurasi"), { code: "STORED_FILE_TOO_LARGE" });
  const encrypted = await fs.promises.readFile(file.path);
  const date = new Date();
  const partition = [date.getUTCFullYear(), String(date.getUTCMonth() + 1).padStart(2, "0")].join("/");
  const key = `${env.fileS3Prefix}/${partition}/${randomUUID()}.sipadi`;
  const checksum = createHash("sha256").update(encrypted).digest("base64");

  await getS3Client().send(new PutObjectCommand({
    Bucket: env.fileS3Bucket,
    Key: key,
    Body: encrypted,
    ContentType: "application/octet-stream",
    ChecksumSHA256: checksum,
    ServerSideEncryption: "aws:kms",
    SSEKMSKeyId: env.fileS3KmsKeyId,
    Metadata: {
      format: "sipadi01",
      classification: "government-record"
    }
  }));

  if (removeLocal) await fs.promises.unlink(file.path);
  file.filename = `${S3_REFERENCE_PREFIX}${key}`;
  if (removeLocal) file.path = null;
  return file;
}

export async function storedObjectExists(reference) {
  if (!isS3StorageReference(reference)) {
    try {
      return (await fs.promises.stat(localPath(reference))).isFile();
    } catch (error) {
      if (error.code === "ENOENT") return false;
      throw error;
    }
  }
  try {
    await getS3Client().send(new HeadObjectCommand({ Bucket: env.fileS3Bucket, Key: objectKey(reference) }));
    return true;
  } catch (error) {
    if (isMissingObject(error)) return false;
    throw error;
  }
}

export async function readStoredObject(reference) {
  if (!isS3StorageReference(reference)) {
    const resolved = localPath(reference);
    const maximum = (env.maxFileSizeMb * 1024 * 1024) + 65536;
    const stat = await fs.promises.stat(resolved);
    if (!stat.isFile() || stat.size > maximum) throw Object.assign(new Error("Ukuran berkas tersimpan melampaui batas konfigurasi"), { code: "STORED_FILE_TOO_LARGE" });
    const input = await fs.promises.readFile(resolved);
    return decryptStoredBuffer(input);
  }

  const result = await getS3Client().send(new GetObjectCommand({
    Bucket: env.fileS3Bucket,
    Key: objectKey(reference)
  }));
  const maximum = (env.maxFileSizeMb * 1024 * 1024) + 65536;
  if (Number(result.ContentLength || 0) > maximum) {
    const error = new Error("Ukuran object tersimpan melampaui batas konfigurasi");
    error.code = "STORED_FILE_TOO_LARGE";
    throw error;
  }
  const input = await bodyToBuffer(result.Body, maximum);
  if (input.length > maximum) {
    const error = new Error("Ukuran object tersimpan melampaui batas konfigurasi");
    error.code = "STORED_FILE_TOO_LARGE";
    throw error;
  }
  return decryptStoredBuffer(input);
}

export async function sendStoredObject(res, reference, {
  filename,
  disposition = "attachment",
  contentType = "application/octet-stream",
  req
} = {}) {
  let stored;
  try {
    stored = await readStoredObject(reference);
  } catch (error) {
    await recordSecurityEvent({
      type: error.code === "PLAINTEXT_STORED_FILE_BLOCKED" ? "PLAINTEXT_STORED_FILE_BLOCKED" : "STORED_FILE_INTEGRITY_FAILED",
      severity: error.code === "PLAINTEXT_STORED_FILE_BLOCKED" ? "high" : "critical",
      req,
      metadata: { code: error.code || "STORED_OBJECT_READ_FAILED", storage: isS3StorageReference(reference) ? "s3" : "local" }
    });
    throw error;
  }

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Length", stored.plaintext.length);
  if (disposition === "inline") res.setHeader("Content-Disposition", "inline");
  else res.attachment(filename || "document");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.locals.storedFileEncryption = { encrypted: stored.encrypted, keyId: stored.keyId };
  return res.send(stored.plaintext);
}
