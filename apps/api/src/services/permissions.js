import { evaluateAccess, SECURITY_CLEARANCE, securityLevelRank } from "./policyEngine.js";

// Role-role yang memiliki akses global untuk metadata dan arsip Biasa.
export const GLOBAL_ARCHIVE_ROLES = new Set(["Admin", "Inspektur", "Sekretaris", "Umpeg"]);

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

function contextFrom(value) {
  if (typeof value === "boolean") return { approvedLoan: value };
  return value || {};
}

export function archivePolicyDecision(user, archive, action, context = {}) {
  return evaluateAccess({
    user,
    resource: archive,
    action,
    context
  });
}

export function canViewArchive(user, archive, context = false) {
  return archivePolicyDecision(user, archive, "archive:view", contextFrom(context)).allowed;
}

export function canAccessAllArchives(user) {
  return GLOBAL_ARCHIVE_ROLES.has(user?.role);
}

export function canDownloadArchive(user, archive, context = false) {
  return archivePolicyDecision(user, archive, "archive:download", contextFrom(context)).allowed;
}

export function canEditArchive(user, archive, context = {}) {
  return archivePolicyDecision(user, archive, "archive:update", contextFrom(context)).allowed;
}

export function canDeleteArchive(user, archive, context = {}) {
  return archivePolicyDecision(user, archive, "archive:delete", contextFrom(context)).allowed;
}

export function canUpdateArchiveStatus(user, archive, context = {}) {
  return archivePolicyDecision(user, archive, "archive:verify", contextFrom(context)).allowed;
}

export function canCreateDisposition(user) {
  return GLOBAL_ARCHIVE_ROLES.has(user?.role);
}

export function canChooseArchiveUnit(user) {
  return GLOBAL_ARCHIVE_ROLES.has(user?.role);
}

export function userCanEditUnitArchive(user, archive) {
  return UNIT_EDIT_ROLES.has(user?.role) && Number(user?.unitId) === Number(archive?.unit_id);
}

export function hasArchiveClearance(user, archive) {
  return Number(user?.securityClearance ?? user?.security_clearance ?? SECURITY_CLEARANCE.Biasa) >=
    securityLevelRank(archive?.security_level ?? archive?.securityLevel);
}
