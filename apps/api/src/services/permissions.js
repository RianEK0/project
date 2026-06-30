const GLOBAL_ARCHIVE_ROLES = new Set(["Admin", "Inspektur", "Sekretaris", "Umpeg"]);
const UNIT_EDIT_ROLES = new Set(["Sub Bag", "Irban Wilayah"]);

export function canViewArchive(user, archive, hasApprovedLoan = false) {
  if (!user || !archive) return false;
  if (GLOBAL_ARCHIVE_ROLES.has(user.role)) return true;
  if (Number(user.unitId) === Number(archive.unit_id)) return true;
  if (archive.created_by === user.id) return true;
  return hasApprovedLoan;
}

export function canDownloadArchive(user, archive, hasApprovedLoan = false) {
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
  if (["Admin", "Inspektur", "Sekretaris", "Umpeg"].includes(user.role)) return true;
  if (user.role === "Sub Bag") {
    return Number(user.unitId) === Number(archive.unit_id);
  }
  return false;
}

export function canCreateDisposition(user) {
  return ["Admin", "Sekretaris", "Inspektur", "Umpeg"].includes(user?.role);
}

export function canChooseArchiveUnit(user) {
  return ["Admin", "Umpeg"].includes(user?.role);
}
