import fs from "fs";
import path from "path";
import multer from "multer";
import { env } from "../config/env.js";
import { createHttpError } from "../utils/http.js";

const uploadDir = path.resolve(process.cwd(), env.uploadDir);
fs.mkdirSync(uploadDir, { recursive: true });

const allowedExtensions = new Set([".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png", ".tif", ".tiff"]);
const allowedMimePrefixes = ["application/pdf", "application/msword", "application/vnd", "image/jpeg", "image/png", "image/tiff"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
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
  return path.join(uploadDir, filePath);
}
