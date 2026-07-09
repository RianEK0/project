// Role-role yang memiliki akses global (lintas semua unit)
const GLOBAL_ARCHIVE_ROLES = new Set(["Admin", "Inspektur", "Sekretaris", "Umpeg"]);

// Role-role yang hanya bisa edit arsip unit sendiri (pegawai)
const UNIT_EDIT_ROLES = new Set([
  "Sub Bag Perencanaan",
  "Sub Bag Keuangan",
  "Irban Wilayah I",
  "Irban Wilayah II",
  "Irban Wilayah III",
  "Irban Wilayah IV",
  "Irban Wilayah V"
]);

export function canViewArchive(user, archive, hasApprovedLoan = false) {
  if (!user || !archive) return false;
  if (GLOBAL_ARCHIVE_ROLES.has(user.role)) return true;
  if (Number(user.unitId) === Number(archive.unit_id)) return true;
  if (archive.created_by === user.id) return true;
  return hasApprovedLoan;
}

export function canDownloadArchive(user, archive, hasApprovedLoan = false) {
  // Dokumen Rahasia tidak boleh diunduh, hanya view-only
  if (archive?.security_level === "Rahasia") return false;
  return canViewArchive(user, archive, hasApprovedLoan);
}

export function canEditArchive(user, archive) {
  if (!user || !archive) return false;
  if (GLOBAL_ARCHIVE_ROLES.has(user.role)) return true;
  return UNIT_EDIT_ROLES.has(user.role) && Number(user?.unitId) === Number(archive?.unit_id);
}

export function canDeleteArchive(user, archive) {
  return canEditArchive(user, archive);
}

export function canUpdateArchiveStatus(user, archive) {
  if (!user || !archive) return false;
  // Semua role global bisa update status
  if (GLOBAL_ARCHIVE_ROLES.has(user.role)) return true;
  // Pegawai hanya bisa update status arsip unitnya sendiri
  if (UNIT_EDIT_ROLES.has(user.role)) {
    return Number(user.unitId) === Number(archive.unit_id);
  }
  return false;
}

export function canCreateDisposition(user) {
  return GLOBAL_ARCHIVE_ROLES.has(user?.role);
}

export function canChooseArchiveUnit(user) {
  return GLOBAL_ARCHIVE_ROLES.has(user?.role);
}
