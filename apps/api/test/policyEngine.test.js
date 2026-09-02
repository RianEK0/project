import test from "node:test";
import assert from "node:assert/strict";
import { evaluateAccess } from "../src/services/policyEngine.js";

const rahasiaArchive = {
  id: 11,
  unit_id: 7,
  created_by: 20,
  security_level: "Rahasia",
  status: "Terverifikasi"
};

test("policy engine default deny untuk action tidak dikenal", () => {
  const decision = evaluateAccess({
    user: { id: 1, role: "Admin", isActive: true },
    action: "archive:unknown"
  });

  assert.equal(decision.allowed, false);
  assert.equal(decision.effect, "DENY");
  assert.equal(decision.code, "UNKNOWN_ACTION");
});

test("policy engine menolak user inactive", () => {
  const decision = evaluateAccess({
    user: { id: 2, role: "Inspektur", isActive: false, securityClearance: 3 },
    resource: rahasiaArchive,
    action: "archive:view",
    context: { recentPasskey: true }
  });

  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, "inactive_user");
});

test("Admin tidak otomatis membaca Rahasia tanpa security clearance", () => {
  const decision = evaluateAccess({
    user: { id: 3, role: "Admin", unitId: 7, securityClearance: 1, isActive: true },
    resource: rahasiaArchive,
    action: "archive:view",
    context: { recentPasskey: true }
  });

  assert.equal(decision.allowed, false);
  assert.equal(decision.code, "INSUFFICIENT_CLEARANCE");
});

test("arsip Rahasia membutuhkan recent passkey meski clearance dan unit cocok", () => {
  const decision = evaluateAccess({
    user: { id: 4, role: "Inspektur", unitId: 7, securityClearance: 3, isActive: true },
    resource: rahasiaArchive,
    action: "archive:view"
  });

  assert.equal(decision.allowed, false);
  assert.equal(decision.effect, "CHALLENGE");
  assert.equal(decision.code, "PASSKEY_STEP_UP_REQUIRED");
});

test("need-to-know dengan grant eksplisit dan recent passkey mengizinkan Rahasia", () => {
  const decision = evaluateAccess({
    user: { id: 5, role: "Sekretaris", unitId: 1, securityClearance: 3, isActive: true },
    resource: rahasiaArchive,
    action: "archive:preview",
    context: {
      recentPasskey: true,
      explicitAccessGrant: [{ access_type: "view" }]
    }
  });

  assert.equal(decision.allowed, true);
  assert.equal(decision.effect, "ALLOW");
});

test("download arsip Rahasia selalu ditolak dari raw endpoint", () => {
  const decision = evaluateAccess({
    user: { id: 6, role: "Admin", unitId: 7, securityClearance: 3, isActive: true },
    resource: rahasiaArchive,
    action: "archive:download",
    context: { recentPasskey: true }
  });

  assert.equal(decision.allowed, false);
  assert.equal(decision.code, "CONFIDENTIAL_DOWNLOAD_DENIED");
});
