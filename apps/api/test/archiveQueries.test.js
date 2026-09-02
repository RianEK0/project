import test from "node:test";
import assert from "node:assert/strict";
import { buildArchiveFilters } from "../src/services/archiveQueries.js";

test("buildArchiveFilters mengecualikan arsip terhapus secara default", () => {
  const result = buildArchiveFilters({ filters: {}, user: { id: 1, role: "Admin", unitId: 10, securityClearance: 1 } });

  assert.match(result.whereSql, /a\.deleted_at IS NULL/);
  assert.match(result.whereSql, /CASE a\.security_level WHEN 'Rahasia' THEN 3 WHEN 'Terbatas' THEN 2 ELSE 1 END <= \$1/);
  assert.deepEqual(result.values, [1, 10, 1]);
});

test("buildArchiveFilters dapat menampilkan trash saja", () => {
  const result = buildArchiveFilters({ filters: { trash: "1" }, user: { id: 1, role: "Admin", unitId: 10, securityClearance: 1 } });

  assert.match(result.whereSql, /a\.deleted_at IS NOT NULL/);
});

test("buildArchiveFilters menambahkan pencarian numeric untuk id arsip", () => {
  const result = buildArchiveFilters({ filters: { search: "25" }, user: { id: 1, role: "Admin", unitId: 10, securityClearance: 1 } });

  assert.match(result.whereSql, /a\.id = \$5/);
  assert.deepEqual(result.values, [1, 10, 1, "%25%", 25]);
});

test("buildArchiveFilters membatasi pegawai ke arsip yang boleh diakses", () => {
  const result = buildArchiveFilters({
    filters: {},
    user: { id: 7, role: "Irban Wilayah II", unitId: 4, securityClearance: 1 }
  });

  assert.match(result.whereSql, /a\.unit_id = \$2/);
  assert.match(result.whereSql, /a\.created_by = \$3/);
  assert.match(result.whereSql, /scope_loan\.status = 'Disetujui'/);
  assert.match(result.whereSql, /archive_access_grants scope_grant/);
  assert.deepEqual(result.values, [1, 4, 7]);
});
