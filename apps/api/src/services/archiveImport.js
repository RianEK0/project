import XLSX from "xlsx";
import { cleanText, createHttpError, parseOptionalInt } from "../utils/http.js";
import { ARCHIVE_CATEGORIES, ARCHIVE_STATUSES, FILE_TYPES } from "./archiveQueries.js";
import { canChooseArchiveUnit } from "./permissions.js";

function ensureValidChoice(value, choices, fieldName) {
  if (!choices.includes(value)) {
    throw createHttpError(422, `${fieldName} tidak valid`);
  }
}

function normalizeSecurityLevel(value) {
  const securityLevel = cleanText(value) || "Biasa";
  const normalized = securityLevel === "Sangat Rahasia" ? "Rahasia" : securityLevel;

  if (!["Biasa", "Terbatas", "Rahasia"].includes(normalized)) {
    throw createHttpError(422, "Tingkat keamanan tidak valid. Pilih: Biasa, Terbatas, atau Rahasia.");
  }

  return normalized;
}

export function resolveImportedArchiveInput(row, user) {
  const title = cleanText(row.title);
  const documentNumber = cleanText(row.document_number || row.documentNumber);
  const documentType = cleanText(row.document_type || row.documentType);
  const status = cleanText(row.status) || "Draft";
  const classification = cleanText(row.classification) || "Internal";
  const archiveCategory = cleanText(row.archive_category || row.archiveCategory) || "Arsip Aktif";
  const description = cleanText(row.description) || "";
  const year = parseOptionalInt(row.year) ?? new Date().getFullYear();
  const requestedUnitId = parseOptionalInt(row.unit_id || row.unitId);
  const unitId = canChooseArchiveUnit(user) ? requestedUnitId ?? user.unitId : user.unitId;
  const fileType = (cleanText(row.file_type || row.fileType) || "PDF").toUpperCase();
  const letterNumber = cleanText(row.letter_number || row.letterNumber) || null;
  const archiveDate = cleanText(row.archive_date || row.archiveDate) || new Date().toISOString().split("T")[0];
  const securityLevel = normalizeSecurityLevel(row.security_level || row.securityLevel);
  const activeRetention = parseOptionalInt(row.active_retention || row.activeRetention) ?? 0;
  const inactiveRetention = parseOptionalInt(row.inactive_retention || row.inactiveRetention) ?? 0;
  const lifecycleStatus = cleanText(row.lifecycle_status || row.lifecycleStatus) || "Aktif";
  const locationRoom = cleanText(row.location_room || row.locationRoom) || null;
  const locationRack = cleanText(row.location_rack || row.locationRack) || null;
  const locationBox = cleanText(row.location_box || row.locationBox) || null;
  const locationFolder = cleanText(row.location_folder || row.locationFolder) || null;
  const locationFileNumber = cleanText(row.location_file_number || row.locationFileNumber) || null;

  if (!title || !documentNumber || !documentType || !unitId) {
    throw createHttpError(422, "Kolom title, document_number, document_type, dan unit_id wajib diisi");
  }

  ensureValidChoice(status, ARCHIVE_STATUSES, "Status dokumen");
  ensureValidChoice(archiveCategory, ARCHIVE_CATEGORIES, "Kategori arsip");
  ensureValidChoice(fileType, FILE_TYPES, "Tipe file");

  if (securityLevel === "Rahasia" && fileType !== "TIFF" && fileType !== "PDF") {
    throw createHttpError(422, "Tingkat keamanan 'Rahasia' hanya diperbolehkan untuk file bertipe TIFF atau PDF.");
  }

  if (fileType === "TIFF" && securityLevel !== "Rahasia") {
    throw createHttpError(422, "Arsip dengan tipe file TIFF wajib menggunakan tingkat keamanan 'Rahasia'.");
  }

  return {
    title,
    documentNumber,
    documentType,
    status,
    classification,
    archiveCategory,
    description,
    year,
    unitId,
    fileType,
    letterNumber,
    archiveDate,
    securityLevel,
    activeRetention,
    inactiveRetention,
    lifecycleStatus,
    locationRoom,
    locationRack,
    locationBox,
    locationFolder,
    locationFileNumber
  };
}

function readRowsFromSpreadsheet(file) {
  if (!file?.buffer) {
    throw createHttpError(422, "File impor wajib diunggah");
  }

  const workbook = XLSX.read(file.buffer, {
    type: "buffer",
    raw: false,
    cellDates: false,
    bookVBA: false,
    bookFiles: false,
    sheetRows: 5002
  });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw createHttpError(422, "File impor tidak memiliki sheet yang dapat dibaca");
  }

  const sheet = workbook.Sheets[firstSheetName];
  const matrix = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
    defval: "",
    blankrows: false
  });

  if (matrix.length < 2) {
    throw createHttpError(422, "File impor harus memiliki header dan minimal satu baris data");
  }

  if (matrix.length > 5001) {
    throw createHttpError(422, "File impor dibatasi maksimal 5.000 baris data");
  }

  if (matrix[0].length > 50) {
    throw createHttpError(422, "File impor dibatasi maksimal 50 kolom");
  }

  const headers = matrix[0].map((value) => String(value || "").trim());
  const unsafeHeader = headers.find((header) => ["__proto__", "prototype", "constructor"].includes(header));
  if (unsafeHeader) {
    throw createHttpError(422, "File impor memiliki nama kolom yang tidak diizinkan");
  }

  const duplicateHeaders = headers.filter((header, index) => header && headers.indexOf(header) !== index);
  if (duplicateHeaders.length) {
    throw createHttpError(422, "File impor memiliki nama kolom duplikat");
  }

  const rows = matrix
    .slice(1)
    .map((cells, index) => ({
      rowNumber: index + 2,
      row: headers.reduce((result, header, headerIndex) => {
        if (header) result[header] = String(cells[headerIndex] || "").slice(0, 5000);
        return result;
      }, Object.create(null))
    }))
    .filter((item) => Object.values(item.row).some((value) => String(value || "").trim() !== ""));

  if (rows.length === 0) {
    throw createHttpError(422, "File impor tidak memiliki data arsip yang bisa diproses");
  }

  return { headers, rows };
}

export async function buildArchiveImportPreview({ file, user, findExistingDocumentNumbers }) {
  const { headers, rows } = readRowsFromSpreadsheet(file);
  const seenDocumentNumbers = new Map();
  const preview = [];
  const rowToDocumentNumber = new Map();

  for (const item of rows) {
    const errors = [];
    let normalized = null;

    try {
      normalized = resolveImportedArchiveInput(item.row, user);
      rowToDocumentNumber.set(item.rowNumber, normalized.documentNumber);

      const duplicateRow = seenDocumentNumbers.get(normalized.documentNumber);
      if (duplicateRow) {
        errors.push(`Nomor dokumen duplikat dengan baris ${duplicateRow}`);
      } else {
        seenDocumentNumbers.set(normalized.documentNumber, item.rowNumber);
      }
    } catch (error) {
      errors.push(error.message);
    }

    preview.push({
      rowNumber: item.rowNumber,
      raw: item.row,
      normalized,
      errors
    });
  }

  const existingDocumentNumbers = await findExistingDocumentNumbers([...seenDocumentNumbers.keys()]);
  const existingSet = new Set(existingDocumentNumbers);

  for (const item of preview) {
    const documentNumber = rowToDocumentNumber.get(item.rowNumber);
    if (documentNumber && existingSet.has(documentNumber)) {
      item.errors.push("Nomor dokumen sudah ada di database");
    }
  }

  const validRows = preview.filter((item) => item.errors.length === 0);
  const invalidRows = preview.length - validRows.length;

  return {
    headers,
    preview,
    validRows,
    summary: {
      totalRows: preview.length,
      validRows: validRows.length,
      invalidRows
    }
  };
}
