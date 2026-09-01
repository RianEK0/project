const BACKUP_TABLES = [
  "organization_units",
  "users",
  "password_history",
  "mfa_recovery_codes",
  "passkey_credentials",
  "archives",
  "archive_comments",
  "dispositions",
  "disposition_history",
  "audit_logs",
  "security_events",
  "archive_lifecycle_logs",
  "notifications",
  "archive_loans",
  "archive_loan_histories",
  "archive_loan_extensions",
  "system_jobs",
  "archive_location_logs",
  "archive_stock_opnames"
];

// Riwayat audit/security aktif tidak boleh ditimpa oleh restore aplikasi.
// Salinannya tetap diekspor untuk kebutuhan forensik dan retensi eksternal.
const RESTORE_TABLES = BACKUP_TABLES.filter((table) => !["audit_logs", "security_events"].includes(table));

const SERIAL_TABLES = [
  ["organization_units", "id"],
  ["users", "id"],
  ["password_history", "id"],
  ["mfa_recovery_codes", "id"],
  ["passkey_credentials", "id"],
  ["archives", "id"],
  ["archive_comments", "id"],
  ["dispositions", "id"],
  ["disposition_history", "id"],
  ["audit_logs", "id"],
  ["security_events", "id"],
  ["archive_lifecycle_logs", "id"],
  ["notifications", "id"],
  ["archive_loans", "id"],
  ["archive_loan_histories", "id"],
  ["archive_loan_extensions", "id"],
  ["archive_location_logs", "id"],
  ["archive_stock_opnames", "id"]
];

function quoteIdentifier(value) {
  return `"${String(value).replace(/"/g, "\"\"")}"`;
}

function normalizeJsonRow(row) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => {
      if (value === undefined) return [key, null];
      return [key, value];
    })
  );
}

export async function exportBackup(client) {
  const data = {};

  for (const table of BACKUP_TABLES) {
    const result = await client.query(`SELECT * FROM ${table} ORDER BY 1 ASC`);
    data[table] = result.rows;
  }

  return {
    app: "SIPADI",
    version: 1,
    exportedAt: new Date().toISOString(),
    tables: BACKUP_TABLES,
    data
  };
}

async function insertRows(client, table, rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return 0;
  }

  const columns = Object.keys(rows[0]);
  const quotedColumns = columns.map(quoteIdentifier).join(", ");

  for (const originalRow of rows) {
    const row = normalizeJsonRow(originalRow);
    const values = columns.map((column) => row[column] ?? null);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

    await client.query(
      `INSERT INTO ${table} (${quotedColumns}) VALUES (${placeholders})`,
      values
    );
  }

  return rows.length;
}

async function syncSequence(client, table, column) {
  await client.query(
    `
      SELECT setval(
        pg_get_serial_sequence($1, $2),
        COALESCE((SELECT MAX(${quoteIdentifier(column)}) FROM ${table}), 1),
        COALESCE((SELECT MAX(${quoteIdentifier(column)}) IS NOT NULL FROM ${table}), FALSE)
      )
    `,
    [table, column]
  );
}

export async function restoreBackup(client, payload) {
  if (!payload || payload.app !== "SIPADI" || typeof payload.data !== "object") {
    throw new Error("File backup tidak valid untuk SIPADI");
  }

  const tables = Array.isArray(payload.tables) && payload.tables.length ? payload.tables : BACKUP_TABLES;

  await client.query(`TRUNCATE TABLE ${RESTORE_TABLES.join(", ")} RESTART IDENTITY CASCADE`);

  const restored = {};

  for (const table of RESTORE_TABLES) {
    const rows = Array.isArray(payload.data[table]) ? payload.data[table] : [];
    restored[table] = await insertRows(client, table, rows);
  }

  for (const [table, column] of SERIAL_TABLES) {
    if (tables.includes(table) && RESTORE_TABLES.includes(table)) {
      await syncSequence(client, table, column);
    }
  }

  return restored;
}

export function summarizeRestoreResult(restored) {
  return Object.entries(restored).reduce((total, [, count]) => total + count, 0);
}
