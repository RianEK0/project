import test from "node:test";
import assert from "node:assert/strict";
import { buildArchiveFilters } from "../src/services/archiveQueries.js";

test("buildArchiveFilters mengecualikan arsip terhapus secara default", () => {
  const result = buildArchiveFilters({ filters: {}, user: { role: "Admin" } });

  assert.match(result.whereSql, /a\.deleted_at IS NULL/);
  assert.deepEqual(result.values, []);
});

test("buildArchiveFilters dapat menampilkan trash saja", () => {
  const result = buildArchiveFilters({ filters: { trash: "1" }, user: { role: "Admin" } });

  assert.match(result.whereSql, /a\.deleted_at IS NOT NULL/);
});

test("buildArchiveFilters menambahkan pencarian numeric untuk id arsip", () => {
  const result = buildArchiveFilters({ filters: { search: "25" }, user: { role: "Admin" } });

  assert.match(result.whereSql, /a\.id = \$2/);
  assert.deepEqual(result.values, ["%25%", 25]);
});

test("buildArchiveFilters membatasi pegawai ke arsip yang boleh diakses", () => {
  const result = buildArchiveFilters({
    filters: {},
    user: { id: 7, role: "Irban Wilayah II", unitId: 4 }
  });

  assert.match(result.whereSql, /a\.unit_id = \$1/);
  assert.match(result.whereSql, /a\.created_by = \$2/);
  assert.match(result.whereSql, /scope_loan\.status = 'Disetujui'/);
  assert.deepEqual(result.values, [4, 7]);
});
