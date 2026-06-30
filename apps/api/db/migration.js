import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://sipadi:sipadi123@localhost:5432/sipadi"
});

async function runMigration() {
  console.log("Memulai migrasi database...");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Alter archives table
    console.log("Menambahkan kolom baru ke tabel archives...");
    await client.query(`
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS letter_number VARCHAR(80);
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS archive_date DATE DEFAULT CURRENT_DATE;
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS security_level VARCHAR(40) DEFAULT 'Biasa';
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS active_retention INTEGER DEFAULT 0;
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS inactive_retention INTEGER DEFAULT 0;
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS lifecycle_status VARCHAR(50) DEFAULT 'Aktif';

      ALTER TABLE archives ADD COLUMN IF NOT EXISTS destruction_ba_number VARCHAR(80);
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS destruction_date DATE;
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS destruction_method VARCHAR(100);
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS destruction_officer VARCHAR(120);
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS destruction_doc_path TEXT;
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS destruction_photo_path TEXT;
    `);

    // Create archive_lifecycle_logs table
    console.log("Membuat tabel archive_lifecycle_logs...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS archive_lifecycle_logs (
        id SERIAL PRIMARY KEY,
        archive_id INTEGER NOT NULL REFERENCES archives(id) ON DELETE CASCADE,
        stage VARCHAR(50) NOT NULL,
        action_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        officer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        notes TEXT,
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Create notifications table
    console.log("Membuat tabel notifications...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        entity_id INTEGER,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Create indexes
    console.log("Membuat index...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_archive_lifecycle_logs_archive_id ON archive_lifecycle_logs(archive_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    `);

    // Create archive_loans table
    console.log("Membuat tabel archive_loans...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS archive_loans (
        id SERIAL PRIMARY KEY,
        archive_id INTEGER NOT NULL REFERENCES archives(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reason TEXT NOT NULL,
        status VARCHAR(40) NOT NULL DEFAULT 'Menunggu Persetujuan' CHECK (status IN ('Menunggu Persetujuan', 'Disetujui', 'Ditolak')),
        notes TEXT,
        approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        approved_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT unique_user_archive_loan UNIQUE(user_id, archive_id)
      );

      CREATE INDEX IF NOT EXISTS idx_archive_loans_user_id ON archive_loans(user_id);
      CREATE INDEX IF NOT EXISTS idx_archive_loans_archive_id ON archive_loans(archive_id);
    `);

    // Update role CHECK constraint to include 'Umpeg'
    console.log("Memperbarui role constraint dan data user...");
    await client.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check
        CHECK (role IN ('Admin', 'Inspektur', 'Sekretaris', 'Sub Bag', 'Irban Wilayah', 'Staff', 'Umpeg'));

      -- Semua user di unit Sub Bag Umum dan Kepegawaian (kode SUB-UMPEG) jadi role Umpeg
      UPDATE users SET role = 'Umpeg'
      WHERE unit_id = (SELECT id FROM organization_units WHERE code = 'SUB-UMPEG' LIMIT 1)
        AND role = 'Sub Bag';

      -- Semua user di unit Sub Bag PEP (kode SUB-PEP) jadi role Staff
      UPDATE users SET role = 'Staff'
      WHERE unit_id = (SELECT id FROM organization_units WHERE code = 'SUB-PEP' LIMIT 1)
        AND role = 'Sub Bag';
    `);

    await client.query("COMMIT");
    console.log("Migrasi database berhasil diselesaikan!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migrasi gagal:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
