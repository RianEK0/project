import test from "node:test";
import assert from "node:assert/strict";
import { canDownloadArchive, canEditArchive, canViewArchive } from "../src/services/permissions.js";

test("role global dapat melihat dan mengedit arsip lintas unit", () => {
  const user = { id: 1, role: "Admin", unitId: 10 };
  const archive = { unit_id: 99, created_by: 2, security_level: "Biasa" };

  assert.equal(canViewArchive(user, archive, false), true);
  assert.equal(canEditArchive(user, archive), true);
  assert.equal(canDownloadArchive(user, archive, false), true);
});

test("pegawai unit sendiri dapat melihat dan mengedit arsip unitnya", () => {
  const user = { id: 2, role: "Sub Bag Perencanaan", unitId: 5 };
  const archive = { unit_id: 5, created_by: 8, security_level: "Biasa" };

  assert.equal(canViewArchive(user, archive, false), true);
  assert.equal(canEditArchive(user, archive), true);
});

test("arsip rahasia tidak dapat diunduh meski boleh dilihat", () => {
  const user = { id: 3, role: "Admin", unitId: 1 };
  const archive = { unit_id: 1, created_by: 3, security_level: "Rahasia" };

  assert.equal(canViewArchive(user, archive, true), true);
  assert.equal(canDownloadArchive(user, archive, true), false);
});
