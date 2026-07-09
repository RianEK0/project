/**
 * migration_roles.js
 * Migrasi restrukturisasi role SiPadi V2:
 * - Hapus role lama: Sub Bag, Irban Wilayah, Staff
 * - Tambah role baru: Sub Bag Perencanaan, Sub Bag Keuangan, Irban Wilayah I-V
 * - Umpeg tetap ada, sekarang setara Admin di level aplikasi
 *
 * Jalankan: node apps/api/db/migration_roles.js
 */

import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://sipadi:sipadi123@localhost:5432/sipadi"
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("🔄 Memulai migrasi role...");

    // 1. Drop constraint lama DULU agar bisa update role user
    await client.query(`
      ALTER TABLE users
        DROP CONSTRAINT IF EXISTS users_role_check
    `);
    console.log("✅ Constraint lama dihapus");

    // 2. Update user dengan role lama ke role baru yang sesuai
    // Sub Bag → Sub Bag Perencanaan (default, bisa diubah manual)
    const subBagResult = await client.query(
      `UPDATE users SET role = 'Sub Bag Perencanaan', updated_at = NOW()
       WHERE role = 'Sub Bag'
       RETURNING id, name, username`
    );
    console.log(`✅ ${subBagResult.rowCount} user 'Sub Bag' → 'Sub Bag Perencanaan'`);

    // Irban Wilayah → Irban Wilayah I (default, bisa diubah manual)
    const irbanResult = await client.query(
      `UPDATE users SET role = 'Irban Wilayah I', updated_at = NOW()
       WHERE role = 'Irban Wilayah'
       RETURNING id, name, username`
    );
    console.log(`✅ ${irbanResult.rowCount} user 'Irban Wilayah' → 'Irban Wilayah I'`);

    // Staff → Sub Bag Perencanaan (default)
    const staffResult = await client.query(
      `UPDATE users SET role = 'Sub Bag Perencanaan', updated_at = NOW()
       WHERE role = 'Staff'
       RETURNING id, name, username`
    );
    console.log(`✅ ${staffResult.rowCount} user 'Staff' → 'Sub Bag Perencanaan'`);

    // 3. Tambahkan constraint baru
    await client.query(`
      ALTER TABLE users
        ADD CONSTRAINT users_role_check
        CHECK (role IN (
          'Admin',
          'Inspektur',
          'Sekretaris',
          'Umpeg',
          'Sub Bag Perencanaan',
          'Sub Bag Keuangan',
          'Irban Wilayah I',
          'Irban Wilayah II',
          'Irban Wilayah III',
          'Irban Wilayah IV',
          'Irban Wilayah V'
        ))
    `);
    console.log("✅ Constraint baru diterapkan");


    await client.query("COMMIT");
    console.log("\n🎉 Migrasi role selesai!");
    console.log("⚠️  Catatan: User yang sebelumnya 'Sub Bag' → 'Sub Bag Perencanaan'");
    console.log("⚠️  Catatan: User yang sebelumnya 'Irban Wilayah' → 'Irban Wilayah I'");
    console.log("⚠️  Catatan: User yang sebelumnya 'Staff' → 'Sub Bag Perencanaan'");
    console.log("   Silakan update manual via halaman Users jika perlu.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Migrasi gagal, rollback dilakukan:", error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
