import { env } from "../config/env.js";

export const SECURITY_CLEARANCE = Object.freeze({
  Biasa: 1,
  Terbatas: 2,
  Rahasia: 3
});

export const SECURITY_CLEARANCE_LABEL = Object.freeze({
  1: "Biasa",
  2: "Terbatas",
  3: "Rahasia"
});

export const POLICY_ACTIONS = Object.freeze([
  "archive:list",
  "archive:view",
  "archive:preview",
  "archive:download",
  "archive:create",
  "archive:update",
  "archive:delete",
  "archive:verify",
  "archive:export",
  "archive:loan",
  "archive:approve",
  "backup:export",
  "backup:restore",
  "user:create",
  "user:update",
  "user:disable",
  "security:manage"
]);

const knownActions = new Set(POLICY_ACTIONS);
const globalArchiveRoles = new Set(["Admin", "Inspektur", "Sekretaris", "Umpeg"]);
const unitEditRoles = new Set([
  "Sub Bag Perencanaan",
  "Sub Bag Keuangan",
  "Irban Wilayah I",
  "Irban Wilayah II",
  "Irban Wilayah III",
  "Irban Wilayah IV",
  "Irban Wilayah V"
]);
const sensitiveArchiveActions = new Set([
  "archive:view",
  "archive:preview",
  "archive:update",
  "archive:delete",
  "archive:verify",
  "archive:export",
  "archive:loan",
  "archive:approve"
]);
const privilegedSystemActions = new Set(["backup:export", "backup:restore", "user:create", "user:update", "user:disable", "security:manage"]);

function clampClearance(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return SECURITY_CLEARANCE.Biasa;
  return Math.min(Math.max(parsed, SECURITY_CLEARANCE.Biasa), SECURITY_CLEARANCE.Rahasia);
}

export function securityLevelRank(value) {
  const normalized = String(value || "Biasa").trim();
  return SECURITY_CLEARANCE[normalized] || SECURITY_CLEARANCE.Biasa;
}

function userClearance(user) {
  return clampClearance(user?.securityClearance ?? user?.security_clearance ?? SECURITY_CLEARANCE.Biasa);
}

function userIsActive(user) {
  return Boolean(user) && (user.isActive ?? user.is_active ?? true) === true;
}

function sameId(left, right) {
  return left !== undefined && left !== null && right !== undefined && right !== null && Number(left) === Number(right);
}

function resourceUnit(resource) {
  return resource?.unitId ?? resource?.unit_id ?? null;
}

function resourceCreator(resource) {
  return resource?.createdBy ?? resource?.created_by ?? null;
}

function resourceSecurityLevel(resource) {
  return resource?.securityLevel ?? resource?.security_level ?? resource?.classification ?? "Biasa";
}

function nowSeconds(context) {
  const current = context?.currentTime || Date.now();
  if (current instanceof Date) return Math.floor(current.getTime() / 1000);
  const parsed = Number(current);
  if (Number.isFinite(parsed)) return parsed > 10_000_000_000 ? Math.floor(parsed / 1000) : Math.floor(parsed);
  return Math.floor(Date.now() / 1000);
}

export function hasRecentPasskeyAuthentication(user, context = {}) {
  if (context.recentPasskey !== undefined) return Boolean(context.recentPasskey);
  const methods = Array.isArray(context.authenticationMethods)
    ? context.authenticationMethods
    : (Array.isArray(user?.authenticationMethods) ? user.authenticationMethods : []);
  const authenticatedAt = Number(context.authenticationTime ?? user?.authenticationTime ?? 0);
  const maxAgeSeconds = Number(context.passkeyMaxAgeSeconds || env.privilegedReauthMaxAgeSeconds);
  return methods.includes("webauthn") && authenticatedAt >= nowSeconds(context) - maxAgeSeconds;
}

function riskScore(context = {}) {
  const direct = Number(context.riskScore);
  if (Number.isFinite(direct)) return Math.max(0, direct);
  const sessionRisk = Number(context.sessionRisk || 0);
  const deviceRisk = Number(context.deviceRisk || 0);
  return Math.max(0, (Number.isFinite(sessionRisk) ? sessionRisk : 0) + (Number.isFinite(deviceRisk) ? deviceRisk : 0));
}

function accessGrantMatches(context = {}, accessType) {
  const grant = context.explicitAccessGrant ?? context.accessGrant;
  if (grant === true) return true;
  const grants = Array.isArray(grant) ? grant : (grant ? [grant] : []);
  return grants.some((item) => {
    const type = typeof item === "string" ? item : item?.accessType ?? item?.access_type;
    if (accessType === "view") return ["view", "download", "edit"].includes(type);
    return type === accessType;
  });
}

function archiveNeedToKnow(user, resource, action, context = {}) {
  const level = securityLevelRank(resourceSecurityLevel(resource));
  const accessType = action === "archive:download"
    ? "download"
    : (["archive:update", "archive:delete", "archive:verify"].includes(action) ? "edit" : "view");

  if (sameId(user?.unitId ?? user?.unit_id, resourceUnit(resource))) return { allowed: true, reason: "same_unit" };
  if (sameId(user?.id, resourceCreator(resource))) return { allowed: true, reason: "owner" };
  if (context.approvedLoan) return { allowed: true, reason: "approved_loan" };
  if (context.approvedAssignment) return { allowed: true, reason: "approved_assignment" };
  if (accessGrantMatches(context, accessType)) return { allowed: true, reason: "explicit_access_grant" };
  if (level === SECURITY_CLEARANCE.Biasa && globalArchiveRoles.has(user?.role)) {
    return { allowed: true, reason: "global_role_for_biasa" };
  }
  return { allowed: false, reason: "need_to_know_missing" };
}

function roleCanPerformArchiveAction(user, action, resource, context = {}) {
  if (["archive:list", "archive:view", "archive:preview"].includes(action)) return true;
  if (action === "archive:download") return true;
  if (action === "archive:create") {
    const requestedUnit = resourceUnit(resource);
    return globalArchiveRoles.has(user?.role) ||
      unitEditRoles.has(user?.role) && (!requestedUnit || sameId(user?.unitId ?? user?.unit_id, requestedUnit));
  }
  if (["archive:update", "archive:delete", "archive:verify"].includes(action)) {
    if (globalArchiveRoles.has(user?.role)) return true;
    if (unitEditRoles.has(user?.role) && sameId(user?.unitId ?? user?.unit_id, resourceUnit(resource))) return true;
    return accessGrantMatches(context, "edit");
  }
  if (["archive:loan", "archive:approve"].includes(action)) return globalArchiveRoles.has(user?.role);
  if (action === "archive:export") return globalArchiveRoles.has(user?.role) || accessGrantMatches(context, "download");
  return false;
}

function roleCanPerformSystemAction(user, action) {
  if (action === "security:manage") return user?.role === "Admin";
  if (["user:create", "user:update", "user:disable", "backup:export", "backup:restore"].includes(action)) {
    return globalArchiveRoles.has(user?.role);
  }
  return false;
}

function makeDecision(effect, reason, extra = {}) {
  return {
    effect,
    allowed: effect === "ALLOW",
    reason,
    ...extra
  };
}

function evaluateArchiveAction({ user, resource, action, context }) {
  const level = securityLevelRank(resourceSecurityLevel(resource));
  const clearance = userClearance(user);
  if (clearance < level) {
    return makeDecision("DENY", "insufficient_clearance", {
      code: "INSUFFICIENT_CLEARANCE",
      message: "Anda tidak memiliki security clearance yang cukup untuk mengakses arsip ini.",
      securityLevel: SECURITY_CLEARANCE_LABEL[level],
      requiredClearance: level,
      userClearance: clearance
    });
  }

  if (action === "archive:download" && level === SECURITY_CLEARANCE.Rahasia) {
    return makeDecision("DENY", "confidential_download_denied", {
      code: "CONFIDENTIAL_DOWNLOAD_DENIED",
      message: "Arsip Rahasia tidak dapat diunduh langsung. Gunakan secure viewer.",
      securityLevel: "Rahasia",
      requiredClearance: level,
      userClearance: clearance
    });
  }

  if (!roleCanPerformArchiveAction(user, action, resource, context)) {
    return makeDecision("DENY", "role_not_allowed", {
      code: "ROLE_NOT_ALLOWED",
      message: "Role Anda tidak memiliki akses ke operasi arsip ini."
    });
  }

  if (action !== "archive:create") {
    const needToKnow = archiveNeedToKnow(user, resource, action, context);
    if (!needToKnow.allowed) {
      return makeDecision("DENY", needToKnow.reason, {
        code: "NEED_TO_KNOW_REQUIRED",
        message: "Akses terhadap arsip ini memerlukan kebutuhan kerja, peminjaman, assignment, atau grant yang sah.",
        securityLevel: SECURITY_CLEARANCE_LABEL[level],
        requiredClearance: level,
        userClearance: clearance
      });
    }
  }

  const score = riskScore(context);
  if (score >= Number(context.riskBlockThreshold || env.abacRiskBlockThreshold)) {
    return makeDecision("DENY", "risk_block", {
      code: "RISK_BLOCK",
      message: "Akses ditolak karena risiko sesi terlalu tinggi.",
      riskScore: score
    });
  }

  if (level === SECURITY_CLEARANCE.Rahasia && sensitiveArchiveActions.has(action)) {
    if (score >= Number(context.riskStepUpThreshold || env.abacRiskStepUpThreshold)) {
      return makeDecision("CHALLENGE", "risk_step_up_required", {
        code: "PASSKEY_STEP_UP_REQUIRED",
        action: "confidential-archive-access",
        message: "Konfirmasi identitas dengan passkey untuk membuka arsip Rahasia.",
        riskScore: score
      });
    }
    if (env.confidentialPasskeyRequired && !hasRecentPasskeyAuthentication(user, context)) {
      return makeDecision("CHALLENGE", "confidential_passkey_required", {
        code: "PASSKEY_STEP_UP_REQUIRED",
        action: "confidential-archive-access",
        message: "Konfirmasi identitas dengan passkey untuk membuka arsip Rahasia.",
        riskScore: score
      });
    }
  }

  return makeDecision("ALLOW", "policy_allow", {
    securityLevel: SECURITY_CLEARANCE_LABEL[level],
    requiredClearance: level,
    userClearance: clearance,
    riskScore: score
  });
}

function evaluateSystemAction({ user, action, context }) {
  if (!roleCanPerformSystemAction(user, action)) {
    return makeDecision("DENY", "role_not_allowed", {
      code: "ROLE_NOT_ALLOWED",
      message: "Role Anda tidak memiliki akses ke operasi sistem ini."
    });
  }
  if (privilegedSystemActions.has(action) && !hasRecentPasskeyAuthentication(user, context)) {
    return makeDecision("CHALLENGE", "system_passkey_required", {
      code: "PASSKEY_STEP_UP_REQUIRED",
      action: action.replace(":", "-"),
      message: "Konfirmasi passkey diperlukan untuk melanjutkan operasi sensitif ini."
    });
  }
  return makeDecision("ALLOW", "policy_allow");
}

export function evaluateAccess({ user, resource = null, action, context = {} } = {}) {
  if (!knownActions.has(action)) {
    return makeDecision("DENY", "unknown_action", {
      code: "UNKNOWN_ACTION",
      message: "Aksi tidak dikenal oleh policy engine."
    });
  }
  if (!userIsActive(user)) {
    return makeDecision("DENY", "inactive_user", {
      code: "INACTIVE_USER",
      message: "Akun tidak aktif."
    });
  }
  if (action === "archive:list") {
    return makeDecision("ALLOW", "active_session_required");
  }
  if (action.startsWith("archive:")) {
    if (!resource && action !== "archive:create") {
      return makeDecision("DENY", "resource_required", {
        code: "RESOURCE_REQUIRED",
        message: "Resource wajib tersedia untuk keputusan akses arsip."
      });
    }
    return evaluateArchiveAction({ user, resource, action, context });
  }
  return evaluateSystemAction({ user, action, context });
}
