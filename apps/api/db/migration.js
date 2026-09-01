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
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS disposal_ba_number VARCHAR(80);
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS disposal_doc_path TEXT;
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS pending_disposal_target VARCHAR(40);
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS pending_disposal_ba_number VARCHAR(80);
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS pending_disposal_doc_path TEXT;
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS disposal_reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS disposal_reviewed_at TIMESTAMPTZ;
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS disposal_approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS disposal_approved_at TIMESTAMPTZ;
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS location_room VARCHAR(120);
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS location_rack VARCHAR(120);
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS location_box VARCHAR(120);
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS location_folder VARCHAR(120);
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS location_file_number VARCHAR(120);
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
      ALTER TABLE archives ADD COLUMN IF NOT EXISTS deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
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

    console.log("Membuat tabel log lokasi dan stock opname arsip...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS archive_location_logs (
        id SERIAL PRIMARY KEY,
        archive_id INTEGER NOT NULL REFERENCES archives(id) ON DELETE CASCADE,
        old_room VARCHAR(120),
        old_rack VARCHAR(120),
        old_box VARCHAR(120),
        old_folder VARCHAR(120),
        old_file_number VARCHAR(120),
        new_room VARCHAR(120),
        new_rack VARCHAR(120),
        new_box VARCHAR(120),
        new_folder VARCHAR(120),
        new_file_number VARCHAR(120),
        notes TEXT,
        moved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS archive_stock_opnames (
        id SERIAL PRIMARY KEY,
        archive_id INTEGER NOT NULL REFERENCES archives(id) ON DELETE CASCADE,
        checked_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(40) NOT NULL CHECK (status IN ('Sesuai', 'Tidak Sesuai Lokasi', 'Tidak Ditemukan', 'Rusak')),
        observed_room VARCHAR(120),
        observed_rack VARCHAR(120),
        observed_box VARCHAR(120),
        observed_folder VARCHAR(120),
        observed_file_number VARCHAR(120),
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Create indexes
    console.log("Membuat index...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_archive_lifecycle_logs_archive_id ON archive_lifecycle_logs(archive_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_archives_deleted_at ON archives(deleted_at);
      CREATE INDEX IF NOT EXISTS idx_archive_location_logs_archive_id ON archive_location_logs(archive_id);
      CREATE INDEX IF NOT EXISTS idx_archive_stock_opnames_archive_id ON archive_stock_opnames(archive_id);
    `);

    // Create archive_loans table
    console.log("Membuat tabel archive_loans...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS archive_loans (
        id SERIAL PRIMARY KEY,
        archive_id INTEGER NOT NULL REFERENCES archives(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reason TEXT NOT NULL,
        status VARCHAR(40) NOT NULL DEFAULT 'Menunggu Persetujuan',
        notes TEXT,
        approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        approved_at TIMESTAMPTZ,
        loan_date DATE,
        loan_deadline DATE,
        return_notes TEXT,
        returned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        returned_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT archive_loans_status_check CHECK (status IN ('Menunggu Persetujuan', 'Disetujui', 'Ditolak', 'Dikembalikan')),
        CONSTRAINT unique_user_archive_loan UNIQUE(user_id, archive_id)
      );

      CREATE INDEX IF NOT EXISTS idx_archive_loans_user_id ON archive_loans(user_id);
      CREATE INDEX IF NOT EXISTS idx_archive_loans_archive_id ON archive_loans(archive_id);
    `);

    // Update role CHECK constraint to include 'Umpeg'
    console.log("Memperbarui role constraint dan data user...");
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_count INTEGER NOT NULL DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_failed_login_at TIMESTAMPTZ;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS login_locked_until TIMESTAMPTZ;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_secret_encrypted TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_pending_secret_encrypted TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_pending_expires_at TIMESTAMPTZ;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_last_used_step BIGINT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled_at TIMESTAMPTZ;
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check
        CHECK (role IN ('Admin', 'Inspektur', 'Sekretaris', 'Umpeg', 'Sub Bag Perencanaan', 'Sub Bag Keuangan', 'Irban Wilayah I', 'Irban Wilayah II', 'Irban Wilayah III', 'Irban Wilayah IV', 'Irban Wilayah V'));

      -- Normalisasi role lama bila database berasal dari versi sebelumnya.
      UPDATE users SET role = 'Umpeg'
      WHERE unit_id = (SELECT id FROM organization_units WHERE code = 'SUB-UMPEG' LIMIT 1)
        AND role = 'Sub Bag';

      UPDATE users SET role = 'Sub Bag Perencanaan'
      WHERE unit_id = (SELECT id FROM organization_units WHERE code = 'SUB-PEP' LIMIT 1)
        AND role = 'Sub Bag';
    `);

    console.log("Membuat registry sesi dan riwayat password...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_history (
        id BIGSERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_password_history_user_created
        ON password_history(user_id, created_at DESC, id DESC);

      CREATE TABLE IF NOT EXISTS user_sessions (
        id BIGSERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_hash CHAR(64) NOT NULL UNIQUE,
        token_version INTEGER NOT NULL,
        auth_methods JSONB NOT NULL DEFAULT '[]'::jsonb,
        step_up_action VARCHAR(80),
        step_up_at TIMESTAMPTZ,
        ip_address VARCHAR(64),
        user_agent VARCHAR(300),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL,
        revoked_at TIMESTAMPTZ,
        revoked_reason VARCHAR(120)
      );
      ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS step_up_action VARCHAR(80);
      ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS step_up_at TIMESTAMPTZ;
      CREATE INDEX IF NOT EXISTS idx_user_sessions_active
        ON user_sessions(user_id, expires_at DESC) WHERE revoked_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at
        ON user_sessions(expires_at);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_revoked_at
        ON user_sessions(revoked_at) WHERE revoked_at IS NOT NULL;
    `);

    console.log("Membuat tabel MFA dan recovery code...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS mfa_recovery_codes (
        id BIGSERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code_hash CHAR(64) NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, code_hash)
      );

      CREATE TABLE IF NOT EXISTS mfa_challenges (
        id BIGSERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash CHAR(64) NOT NULL UNIQUE,
        attempt_count INTEGER NOT NULL DEFAULT 0,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_mfa_recovery_codes_user_unused
        ON mfa_recovery_codes(user_id, used_at);
      CREATE INDEX IF NOT EXISTS idx_mfa_challenges_expiry
        ON mfa_challenges(expires_at);

      CREATE TABLE IF NOT EXISTS passkey_credentials (
        id BIGSERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        credential_id TEXT NOT NULL UNIQUE,
        public_key BYTEA NOT NULL,
        counter BIGINT NOT NULL DEFAULT 0,
        transports JSONB NOT NULL DEFAULT '[]'::jsonb,
        device_type VARCHAR(30),
        backed_up BOOLEAN NOT NULL DEFAULT FALSE,
        name VARCHAR(100) NOT NULL DEFAULT 'Passkey',
        last_used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_passkey_credentials_user_id
        ON passkey_credentials(user_id);

      CREATE TABLE IF NOT EXISTS webauthn_challenges (
        id BIGSERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash CHAR(64) NOT NULL UNIQUE,
        challenge TEXT NOT NULL,
        purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('registration', 'authentication', 'step_up')),
        mfa_challenge_id BIGINT REFERENCES mfa_challenges(id) ON DELETE CASCADE,
        session_id BIGINT REFERENCES user_sessions(id) ON DELETE CASCADE,
        action VARCHAR(80),
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      ALTER TABLE webauthn_challenges ADD COLUMN IF NOT EXISTS session_id BIGINT REFERENCES user_sessions(id) ON DELETE CASCADE;
      ALTER TABLE webauthn_challenges ADD COLUMN IF NOT EXISTS action VARCHAR(80);
      ALTER TABLE webauthn_challenges DROP CONSTRAINT IF EXISTS webauthn_challenges_purpose_check;
      ALTER TABLE webauthn_challenges ADD CONSTRAINT webauthn_challenges_purpose_check
        CHECK (purpose IN ('registration', 'authentication', 'step_up'));
      ALTER TABLE webauthn_challenges DROP CONSTRAINT IF EXISTS webauthn_challenges_context_check;
      ALTER TABLE webauthn_challenges ADD CONSTRAINT webauthn_challenges_context_check CHECK (
        (purpose = 'registration' AND mfa_challenge_id IS NULL AND session_id IS NULL AND action IS NULL) OR
        (purpose = 'authentication' AND mfa_challenge_id IS NOT NULL AND session_id IS NULL AND action IS NULL) OR
        (purpose = 'step_up' AND mfa_challenge_id IS NULL AND session_id IS NOT NULL AND action IS NOT NULL)
      );

      CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_expiry
        ON webauthn_challenges(expires_at);
      WITH duplicate_challenges AS (
        SELECT id, ROW_NUMBER() OVER (
          PARTITION BY user_id, purpose ORDER BY created_at DESC, id DESC
        ) AS position
        FROM webauthn_challenges WHERE used_at IS NULL
      )
      DELETE FROM webauthn_challenges wc
      USING duplicate_challenges duplicate
      WHERE wc.id = duplicate.id AND duplicate.position > 1;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_webauthn_challenges_one_pending
        ON webauthn_challenges(user_id, purpose) WHERE used_at IS NULL;
    `);

    console.log("Mengaktifkan audit log append-only dan tamper-evident...");
    await client.query(`
      ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS previous_hash CHAR(64);
      ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entry_hash CHAR(64);
      ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS signing_key_id VARCHAR(80);
      ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_audit_logs_entry_hash
        ON audit_logs(entry_hash) WHERE entry_hash IS NOT NULL;

      CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
      RETURNS TRIGGER AS $$
      BEGIN
        RAISE EXCEPTION 'audit_logs bersifat append-only';
      END;
      $$ LANGUAGE plpgsql;

      CREATE OR REPLACE FUNCTION enforce_signed_audit_insert()
      RETURNS TRIGGER AS $$
      DECLARE
        current_head CHAR(64);
      BEGIN
        PERFORM pg_advisory_xact_lock(742112045);
        IF NEW.entry_hash IS NULL OR NEW.signing_key_id IS NULL THEN
          RAISE EXCEPTION 'audit_logs baru wajib memiliki tanda tangan integritas';
        END IF;
        SELECT entry_hash INTO current_head
          FROM audit_logs WHERE entry_hash IS NOT NULL ORDER BY id DESC LIMIT 1;
        IF NEW.previous_hash IS DISTINCT FROM current_head THEN
          RAISE EXCEPTION 'rantai audit_logs tidak terhubung ke hash terakhir';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_audit_logs_append_only ON audit_logs;
      CREATE TRIGGER trg_audit_logs_append_only
      BEFORE UPDATE OR DELETE ON audit_logs
      FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();

      DROP TRIGGER IF EXISTS trg_audit_logs_no_truncate ON audit_logs;
      CREATE TRIGGER trg_audit_logs_no_truncate
      BEFORE TRUNCATE ON audit_logs
      FOR EACH STATEMENT EXECUTE FUNCTION prevent_audit_log_mutation();

      DROP TRIGGER IF EXISTS trg_audit_logs_signed_insert ON audit_logs;
      CREATE TRIGGER trg_audit_logs_signed_insert
      BEFORE INSERT ON audit_logs
      FOR EACH ROW EXECUTE FUNCTION enforce_signed_audit_insert();
    `);

    // Add loan and return columns to archive_loans (if not exist)
    console.log("Menambahkan kolom peminjaman dan pengembalian ke archive_loans...");
    await client.query(`
      ALTER TABLE archive_loans ADD COLUMN IF NOT EXISTS loan_date DATE;
      ALTER TABLE archive_loans ADD COLUMN IF NOT EXISTS loan_deadline DATE;
      ALTER TABLE archive_loans ADD COLUMN IF NOT EXISTS return_notes TEXT;
      ALTER TABLE archive_loans ADD COLUMN IF NOT EXISTS returned_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE archive_loans ADD COLUMN IF NOT EXISTS returned_at TIMESTAMPTZ;
      ALTER TABLE archive_loans DROP CONSTRAINT IF EXISTS archive_loans_status_check;
      ALTER TABLE archive_loans ADD CONSTRAINT archive_loans_status_check
        CHECK (status IN ('Menunggu Persetujuan', 'Disetujui', 'Ditolak', 'Dikembalikan'));
    `);

    console.log("Membuat tabel histori dan perpanjangan peminjaman...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS archive_loan_histories (
        id SERIAL PRIMARY KEY,
        loan_id INTEGER NOT NULL REFERENCES archive_loans(id) ON DELETE CASCADE,
        archive_id INTEGER NOT NULL REFERENCES archives(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reason TEXT NOT NULL,
        status VARCHAR(40) NOT NULL DEFAULT 'Menunggu Persetujuan',
        notes TEXT,
        approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        approved_at TIMESTAMPTZ,
        loan_date DATE,
        loan_deadline DATE,
        return_notes TEXT,
        returned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        returned_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT archive_loan_histories_status_check CHECK (status IN ('Menunggu Persetujuan', 'Disetujui', 'Ditolak', 'Dikembalikan'))
      );

      CREATE INDEX IF NOT EXISTS idx_archive_loan_histories_archive_id ON archive_loan_histories(archive_id);
      CREATE INDEX IF NOT EXISTS idx_archive_loan_histories_loan_id ON archive_loan_histories(loan_id);
      CREATE INDEX IF NOT EXISTS idx_archive_loan_histories_user_id ON archive_loan_histories(user_id);

      CREATE TABLE IF NOT EXISTS archive_loan_extensions (
        id SERIAL PRIMARY KEY,
        loan_history_id INTEGER NOT NULL REFERENCES archive_loan_histories(id) ON DELETE CASCADE,
        loan_id INTEGER NOT NULL REFERENCES archive_loans(id) ON DELETE CASCADE,
        requested_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        current_deadline DATE NOT NULL,
        requested_deadline DATE NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(40) NOT NULL DEFAULT 'Menunggu Persetujuan',
        review_notes TEXT,
        reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT archive_loan_extensions_status_check CHECK (status IN ('Menunggu Persetujuan', 'Disetujui', 'Ditolak')),
        CONSTRAINT archive_loan_extensions_deadline_check CHECK (requested_deadline > current_deadline)
      );

      CREATE INDEX IF NOT EXISTS idx_archive_loan_extensions_history_id ON archive_loan_extensions(loan_history_id);
      CREATE INDEX IF NOT EXISTS idx_archive_loan_extensions_loan_id ON archive_loan_extensions(loan_id);
      CREATE INDEX IF NOT EXISTS idx_archive_loan_extensions_status ON archive_loan_extensions(status);
    `);

    console.log("Backfill histori peminjaman lama...");
    await client.query(`
      INSERT INTO archive_loan_histories (
        loan_id,
        archive_id,
        user_id,
        reason,
        status,
        notes,
        approved_by,
        approved_at,
        loan_date,
        loan_deadline,
        return_notes,
        returned_by,
        returned_at,
        created_at,
        updated_at
      )
      SELECT
        l.id,
        l.archive_id,
        l.user_id,
        l.reason,
        l.status,
        l.notes,
        l.approved_by,
        l.approved_at,
        l.loan_date,
        l.loan_deadline,
        l.return_notes,
        l.returned_by,
        l.returned_at,
        l.created_at,
        l.updated_at
      FROM archive_loans l
      WHERE NOT EXISTS (
        SELECT 1
        FROM archive_loan_histories h
        WHERE h.loan_id = l.id
      );
    `);

    console.log("Membuat tabel status job sistem...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_jobs (
        job_name VARCHAR(80) PRIMARY KEY,
        last_run_at TIMESTAMPTZ,
        last_status VARCHAR(30) NOT NULL DEFAULT 'idle',
        last_message TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    console.log("Membuat tabel pusat insiden keamanan...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS security_events (
        id BIGSERIAL PRIMARY KEY,
        event_type VARCHAR(80) NOT NULL,
        severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        ip_address VARCHAR(64) NOT NULL,
        user_id INTEGER,
        request_id VARCHAR(80),
        method VARCHAR(12),
        path VARCHAR(300),
        status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'resolved')),
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        reviewed_by INTEGER,
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      ALTER TABLE security_events DROP CONSTRAINT IF EXISTS security_events_user_id_fkey;
      ALTER TABLE security_events DROP CONSTRAINT IF EXISTS security_events_reviewed_by_fkey;

      CREATE INDEX IF NOT EXISTS idx_security_events_created_at
        ON security_events(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_security_events_status_severity
        ON security_events(status, severity, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_security_events_ip_address
        ON security_events(ip_address, created_at DESC);

      CREATE TABLE IF NOT EXISTS critical_operation_approvals (
        id BIGSERIAL PRIMARY KEY,
        action VARCHAR(80) NOT NULL CHECK (action IN (
          'BACKUP_EXPORT', 'BACKUP_RESTORE', 'RESET_MFA',
          'PRIVILEGED_USER_CREATE', 'PRIVILEGED_USER_UPDATE',
          'PRIVILEGED_USER_PASSWORD_RESET', 'PRIVILEGED_USER_DEACTIVATE'
        )),
        resource_key VARCHAR(160) NOT NULL DEFAULT '',
        payload_hash CHAR(64) NOT NULL,
        requested_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        request_reason VARCHAR(500) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending'
          CHECK (status IN ('pending', 'approved', 'rejected', 'executed', 'expired')),
        approved_by INTEGER REFERENCES users(id) ON DELETE RESTRICT,
        approval_reason VARCHAR(500),
        requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL,
        decided_at TIMESTAMPTZ,
        executed_at TIMESTAMPTZ,
        executed_request_id VARCHAR(80),
        CHECK (approved_by IS NULL OR approved_by <> requested_by)
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_critical_approval_active
        ON critical_operation_approvals(action, resource_key, payload_hash, requested_by)
        WHERE status IN ('pending', 'approved');
      CREATE INDEX IF NOT EXISTS idx_critical_approval_queue
        ON critical_operation_approvals(status, expires_at, requested_at DESC);

      CREATE TABLE IF NOT EXISTS data_egress_events (
        id BIGSERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        operation VARCHAR(80) NOT NULL,
        weight INTEGER NOT NULL CHECK (weight BETWEEN 1 AND 10000),
        entity_id BIGINT,
        classification VARCHAR(80),
        request_id VARCHAR(80),
        was_blocked BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_data_egress_events_user_created
        ON data_egress_events(user_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS data_egress_holds (
        id BIGSERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reason VARCHAR(160) NOT NULL,
        event_count INTEGER NOT NULL,
        blocked_until TIMESTAMPTZ NOT NULL,
        released_at TIMESTAMPTZ,
        released_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        release_reason VARCHAR(500),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_data_egress_hold_active
        ON data_egress_holds(user_id) WHERE released_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_data_egress_hold_expiry
        ON data_egress_holds(blocked_until) WHERE released_at IS NULL;
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
