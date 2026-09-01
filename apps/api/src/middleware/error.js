import { env } from "../config/env.js";
import { HttpError } from "../utils/http.js";

export function notFound(req, res, next) {
  next(new HttpError(404, `Endpoint ${req.method} ${req.path} tidak ditemukan`));
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const isMalformedJson = error instanceof SyntaxError && error.type === "entity.parse.failed";
  const isUploadError = error.name === "MulterError";
  const status = error.status || (isMalformedJson ? 400 : isUploadError ? (error.code === "LIMIT_FILE_SIZE" ? 413 : 400) : 500);
  const payload = {
    message: isMalformedJson
      ? "Body JSON tidak valid"
      : isUploadError
        ? error.code === "LIMIT_FILE_SIZE"
          ? "Ukuran file melebihi batas yang diizinkan"
          : "Upload file tidak valid"
        : status >= 500
          ? "Terjadi kesalahan server"
          : error.message,
    requestId: req.requestId
  };

  if (error.details) payload.details = error.details;
  if (env.nodeEnv !== "production" && status >= 500) {
    payload.error = error.message;
    payload.stack = error.stack;
  }

  if (status >= 500) {
    console.error(`[${req.requestId || "no-request-id"}]`, error);
  }

  return res.status(status).json(payload);
}
