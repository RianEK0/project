import fs from "fs";
import path from "path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { env } from "../config/env.js";
import { createHttpError } from "../utils/http.js";
import { scanFileWithClamav } from "../services/malwareScanner.js";
import { recordSecurityEvent } from "../services/securityEvents.js";
import { encryptStoredFile } from "../services/storedFileEncryption.js";
import { persistEncryptedUpload } from "../services/fileStorage.js";

const uploadDir = path.resolve(process.cwd(), env.uploadDir);
fs.mkdirSync(uploadDir, { recursive: true });

const allowedExtensions = new Set([".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png", ".tif", ".tiff"]);
const allowedMimePrefixes = ["application/pdf", "application/msword", "application/vnd", "image/jpeg", "image/png", "image/tiff"];
const csvMimePrefixes = ["text/csv", "application/csv", "application/vnd.ms-excel", "text/plain"];
const spreadsheetExtensions = new Set([".csv", ".xls", ".xlsx"]);
const spreadsheetMimePrefixes = [
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/octet-stream"
];
const jsonMimePrefixes = ["application/json", "text/json", "application/octet-stream", "text/plain"];
const backupExtensions = new Set([".sipadi", ".json"]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${randomUUID()}${ext}`;
    cb(null, safeName);
  }
});

export const archiveUpload = multer({
  storage,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeAllowed = allowedMimePrefixes.some((prefix) => file.mimetype.startsWith(prefix));

    if (!allowedExtensions.has(ext) || !mimeAllowed) {
      return cb(createHttpError(400, "Format file tidak diizinkan. Gunakan PDF, DOCX, XLSX, JPG, PNG, atau TIFF."));
    }

    return cb(null, true);
  }
});

export const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeAllowed = csvMimePrefixes.some((prefix) => file.mimetype.startsWith(prefix));

    if (ext !== ".csv" || !mimeAllowed) {
      return cb(createHttpError(400, "Format file tidak diizinkan. Gunakan file CSV."));
    }

    return cb(null, true);
  }
});

export const spreadsheetUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxImportFileSizeMb * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeAllowed = spreadsheetMimePrefixes.some((prefix) => file.mimetype.startsWith(prefix));

    if (!spreadsheetExtensions.has(ext) || !mimeAllowed) {
      return cb(createHttpError(400, "Format file tidak diizinkan. Gunakan file CSV, XLS, atau XLSX."));
    }

    return cb(null, true);
  }
});

export const jsonUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeAllowed = jsonMimePrefixes.some((prefix) => file.mimetype.startsWith(prefix));

    if (ext !== ".json" || !mimeAllowed) {
      return cb(createHttpError(400, "Format file tidak diizinkan. Gunakan file JSON hasil backup SIPADI."));
    }

    return cb(null, true);
  }
});

export const backupUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxBackupFileSizeMb * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeAllowed = jsonMimePrefixes.some((prefix) => file.mimetype.startsWith(prefix));
    if (!backupExtensions.has(ext) || !mimeAllowed) {
      return cb(createHttpError(400, "Gunakan file backup .sipadi terenkripsi."));
    }
    return cb(null, true);
  }
});

function hasPrefix(buffer, bytes) {
  return bytes.every((byte, index) => buffer[index] === byte);
}

export function matchesFileSignature(extension, buffer) {
  const ext = String(extension || "").toLowerCase();
  if (!Buffer.isBuffer(buffer) || buffer.length < 4) return false;

  if (ext === ".pdf") return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  if (ext === ".jpg" || ext === ".jpeg") return hasPrefix(buffer, [0xff, 0xd8, 0xff]);
  if (ext === ".png") return hasPrefix(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (ext === ".tif" || ext === ".tiff") {
    return hasPrefix(buffer, [0x49, 0x49, 0x2a, 0x00]) || hasPrefix(buffer, [0x4d, 0x4d, 0x00, 0x2a]);
  }
  if (ext === ".doc" || ext === ".xls") return hasPrefix(buffer, [0xd0, 0xcf, 0x11, 0xe0]);
  if (ext === ".docx" || ext === ".xlsx") return hasPrefix(buffer, [0x50, 0x4b, 0x03, 0x04]);
  return false;
}

async function removeUploadedFiles(files) {
  await Promise.all(files.filter((file) => file?.path).map((file) => fs.promises.unlink(file.path).catch(() => undefined)));
}

function uploadedFilesFromRequest(req) {
  return [
    ...(req.file ? [req.file] : []),
    ...Object.values(req.files || {}).flat()
  ];
}

export async function validateArchiveFiles(req, res, next) {
  const files = uploadedFilesFromRequest(req);

  if (files.length) {
    res.once("finish", () => {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        void removeUploadedFiles(files);
      }
    });
  }

  try {
    for (const file of files) {
      const handle = await fs.promises.open(file.path, "r");
      try {
        const signature = Buffer.alloc(16);
        const { bytesRead } = await handle.read(signature, 0, signature.length, 0);
        const ext = path.extname(file.originalname).toLowerCase();
        if (!matchesFileSignature(ext, signature.subarray(0, bytesRead))) {
          await removeUploadedFiles(files);
          throw createHttpError(400, "Isi file tidak sesuai dengan format atau ekstensi yang diunggah");
        }
      } finally {
        await handle.close();
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}

export async function scanUploadedFiles(req, res, next) {
  const files = uploadedFilesFromRequest(req);
  if (!files.length) return next();
  if (!env.clamavHost && !env.clamavRequired) return next();

  try {
    for (const file of files) {
      const result = await scanFileWithClamav(file);
      if (!result.clean) {
        await removeUploadedFiles(files);
        await recordSecurityEvent({
          type: "MALWARE_UPLOAD_BLOCKED",
          severity: "critical",
          req,
          metadata: {
            signature: result.signature,
            filename: file.originalname,
            size: file.size
          }
        });
        throw createHttpError(422, "File ditolak karena terdeteksi mengandung malware");
      }
    }
    return next();
  } catch (error) {
    if (error.status === 422) return next(error);

    await recordSecurityEvent({
      type: "ANTIVIRUS_UNAVAILABLE",
      severity: env.clamavRequired ? "high" : "medium",
      req,
      metadata: { code: error.code || "CLAMAV_ERROR" }
    });

    if (!env.clamavRequired) {
      console.warn(`ClamAV opsional tidak tersedia: ${error.code || error.message}`);
      return next();
    }

    await removeUploadedFiles(files);
    return next(createHttpError(503, "Upload ditunda karena layanan antivirus tidak tersedia"));
  }
}

export async function encryptUploadedFiles(req, res, next) {
  const files = uploadedFilesFromRequest(req).filter((file) => file.path);
  if (!files.length) return next();

  try {
    for (const file of files) {
      await encryptStoredFile(file.path);
      await persistEncryptedUpload(file);
    }
    return next();
  } catch (error) {
    await removeUploadedFiles(files);
    await recordSecurityEvent({
      type: "FILE_ENCRYPTION_FAILED",
      severity: "critical",
      req,
      metadata: { code: error.code || "FILE_ENCRYPTION_ERROR", fileCount: files.length }
    });
    return next(createHttpError(503, "Upload ditunda karena enkripsi penyimpanan gagal"));
  }
}

export function uploadedFileToDb(file) {
  if (!file) return {};
  const ext = path.extname(file.originalname).replace(".", "").toUpperCase();
  return {
    filePath: file.filename,
    fileOriginalName: file.originalname,
    fileSize: file.size,
    fileType: ["JPEG", "TIF"].includes(ext) ? (ext === "JPEG" ? "JPG" : "TIFF") : ext
  };
}

export function resolveUploadPath(filePath) {
  if (
    typeof filePath !== "string" ||
    !filePath ||
    filePath.includes("/") ||
    filePath.includes("\\") ||
    path.basename(filePath) !== filePath
  ) {
    throw createHttpError(400, "Lokasi file arsip tidak valid");
  }

  const resolved = path.resolve(uploadDir, filePath);
  if (path.dirname(resolved) !== uploadDir) {
    throw createHttpError(400, "Lokasi file arsip tidak valid");
  }
  return resolved;
}
