export const ROLES = ["Admin", "Inspektur", "Sekretaris", "Umpeg", "Sub Bag", "Irban Wilayah", "Staff"];

export const GLOBAL_ROLES = ["Admin", "Inspektur", "Sekretaris", "Umpeg"];
export const UNIT_EDIT_ROLES = ["Sub Bag", "Irban Wilayah"];

export const ARCHIVE_STATUSES = ["Draft", "Menunggu Review", "Terverifikasi", "Ditolak", "Diarsipkan"];

export const ARCHIVE_CATEGORIES = [
  { value: "Arsip Aktif", description: "Masih sering digunakan." },
  { value: "Arsip Inaktif", description: "Sudah jarang digunakan tetapi masih disimpan." },
  { value: "Arsip Statis", description: "Memiliki nilai sejarah, disimpan permanen." },
  { value: "Arsip Musnah", description: "Masa retensinya habis dan dapat dimusnahkan sesuai prosedur." }
];

export const DISPOSITION_STATUSES = ["Dikirim", "Dibaca", "Diproses", "Selesai", "Dibatalkan"];

export const DOCUMENT_TYPES = [
  "Laporan Hasil Pemeriksaan",
  "Surat Masuk",
  "Surat Tugas",
  "Nota Dinas",
  "Berita Acara",
  "Bukti Dukung"
];

export const FILE_TYPES = ["PDF", "DOC", "DOCX", "XLS", "XLSX", "JPG", "PNG", "TIFF"];
export const SECURITY_LEVELS = ["Biasa", "Terbatas", "Rahasia"];

export function canAccessGlobal(role) {
  return GLOBAL_ROLES.includes(role);
}

export function canChooseArchiveUnit(user) {
  return ["Admin", "Umpeg"].includes(user?.role);
}

export function canViewArchive(user, archive, hasApprovedLoan = false) {
  if (!user || !archive) return false;
  if (GLOBAL_ROLES.includes(user.role)) return true;
  if (Number(user.unitId) === Number(archive.unit_id)) return true;
  if (archive.created_by === user.id) return true;
  return hasApprovedLoan || archive.loan_status === "Disetujui";
}

export function canDownloadArchive(user, archive, hasApprovedLoan = false) {
  return canViewArchive(user, archive, hasApprovedLoan);
}

export function canEditArchive(user, archive) {
  if (!user || !archive) return false;
  if (GLOBAL_ROLES.includes(user.role)) return true;
  return UNIT_EDIT_ROLES.includes(user.role) && Number(user?.unitId) === Number(archive?.unit_id);
}

export function canDeleteArchive(user, archive) {
  return canEditArchive(user, archive);
}

export function canUpdateArchiveStatus(user, archive) {
  if (!user || !archive) return false;
  if (["Admin", "Inspektur", "Sekretaris", "Umpeg"].includes(user.role)) return true;
  if (user.role === "Sub Bag") {
    return Number(user.unitId) === Number(archive.unit_id);
  }
  return false;
}

export function canCreateDisposition(user) {
  return ["Admin", "Sekretaris", "Inspektur", "Umpeg"].includes(user?.role);
}
