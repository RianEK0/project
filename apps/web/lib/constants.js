export const ROLES = [
  "Admin",
  "Inspektur",
  "Sekretaris",
  "Umpeg",
  "Sub Bag Perencanaan",
  "Sub Bag Keuangan",
  "Irban Wilayah I",
  "Irban Wilayah II",
  "Irban Wilayah III",
  "Irban Wilayah IV",
  "Irban Wilayah V"
];

// Role dengan akses global lintas semua unit
export const GLOBAL_ROLES = ["Admin", "Inspektur", "Sekretaris", "Umpeg"];

// Role pegawai dengan akses terbatas unit sendiri
export const UNIT_EDIT_ROLES = [
  "Sub Bag Perencanaan",
  "Sub Bag Keuangan",
  "Irban Wilayah I",
  "Irban Wilayah II",
  "Irban Wilayah III",
  "Irban Wilayah IV",
  "Irban Wilayah V"
];

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
const SECURITY_LEVEL_RANK = { Biasa: 1, Terbatas: 2, Rahasia: 3 };

function userClearance(user) {
  const parsed = Number(user?.securityClearance ?? user?.security_clearance ?? 1);
  return Number.isInteger(parsed) ? Math.min(Math.max(parsed, 1), 3) : 1;
}

function archiveSecurityLevel(archive) {
  return archive?.securityLevel || archive?.security_level || "Biasa";
}

function hasClearance(user, archive) {
  return userClearance(user) >= (SECURITY_LEVEL_RANK[archiveSecurityLevel(archive)] || 1);
}

function hasNeedToKnow(user, archive, hasApprovedLoan) {
  const level = SECURITY_LEVEL_RANK[archiveSecurityLevel(archive)] || 1;
  if (Number(user?.unitId) === Number(archive?.unit_id)) return true;
  if (Number(archive?.created_by) === Number(user?.id)) return true;
  if (hasApprovedLoan || archive?.loan_status === "Disetujui") return true;
  return level === 1 && GLOBAL_ROLES.includes(user?.role);
}

export function canAccessGlobal(role) {
  return GLOBAL_ROLES.includes(role);
}

export function canChooseArchiveUnit(user) {
  return GLOBAL_ROLES.includes(user?.role);
}

export function canViewArchive(user, archive, hasApprovedLoan = false) {
  if (!user || !archive) return false;
  return hasClearance(user, archive) && hasNeedToKnow(user, archive, hasApprovedLoan);
}

export function canDownloadArchive(user, archive, hasApprovedLoan = false) {
  // Dokumen Rahasia tidak boleh diunduh, hanya view-only
  if (archive?.security_level === "Rahasia") return false;
  return canViewArchive(user, archive, hasApprovedLoan);
}

export function canEditArchive(user, archive) {
  if (!user || !archive) return false;
  if (!hasClearance(user, archive) || !hasNeedToKnow(user, archive, false)) return false;
  return GLOBAL_ROLES.includes(user.role) ||
    (UNIT_EDIT_ROLES.includes(user.role) && Number(user?.unitId) === Number(archive?.unit_id));
}

export function canDeleteArchive(user, archive) {
  return canEditArchive(user, archive);
}

export function canUpdateArchiveStatus(user, archive) {
  if (!user || !archive) return false;
  if (!hasClearance(user, archive) || !hasNeedToKnow(user, archive, false)) return false;
  if (GLOBAL_ROLES.includes(user.role)) return true;
  if (UNIT_EDIT_ROLES.includes(user.role)) {
    return Number(user.unitId) === Number(archive.unit_id);
  }
  return false;
}

export function canCreateDisposition(user) {
  return GLOBAL_ROLES.includes(user?.role);
}
