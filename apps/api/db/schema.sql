CREATE TABLE IF NOT EXISTS organization_units (
  id SERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  code VARCHAR(40) NOT NULL UNIQUE,
  parent_id INTEGER REFERENCES organization_units(id) ON DELETE SET NULL,
  unit_type VARCHAR(60) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  username VARCHAR(60) NOT NULL UNIQUE,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(40) NOT NULL CHECK (role IN ('Admin', 'Inspektur', 'Sekretaris', 'Sub Bag', 'Irban Wilayah', 'Staff', 'Umpeg')),
  unit_id INTEGER REFERENCES organization_units(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS archives (
  id SERIAL PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  document_number VARCHAR(80) NOT NULL UNIQUE,
  unit_id INTEGER NOT NULL REFERENCES organization_units(id) ON DELETE RESTRICT,
  document_type VARCHAR(80) NOT NULL,
  file_type VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  status VARCHAR(40) NOT NULL CHECK (status IN ('Draft', 'Menunggu Review', 'Terverifikasi', 'Ditolak', 'Diarsipkan')),
  classification VARCHAR(60) NOT NULL DEFAULT 'Internal',
  archive_category VARCHAR(40) NOT NULL DEFAULT 'Arsip Aktif' CHECK (archive_category IN ('Arsip Aktif', 'Arsip Inaktif', 'Arsip Statis', 'Arsip Musnah')),
  description TEXT,
  file_path TEXT,
  file_original_name TEXT,
  file_size INTEGER,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  letter_number VARCHAR(80),
  archive_date DATE DEFAULT CURRENT_DATE,
  security_level VARCHAR(40) DEFAULT 'Biasa',
  active_retention INTEGER DEFAULT 0,
  inactive_retention INTEGER DEFAULT 0,
  lifecycle_status VARCHAR(50) DEFAULT 'Aktif',
  destruction_ba_number VARCHAR(80),
  destruction_date DATE,
  destruction_method VARCHAR(100),
  destruction_officer VARCHAR(120),
  destruction_doc_path TEXT,
  destruction_photo_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE archives
  ADD COLUMN IF NOT EXISTS archive_category VARCHAR(40) NOT NULL DEFAULT 'Arsip Aktif';

ALTER TABLE archives
  DROP CONSTRAINT IF EXISTS archives_archive_category_check;

ALTER TABLE archives
  ADD CONSTRAINT archives_archive_category_check
  CHECK (archive_category IN ('Arsip Aktif', 'Arsip Inaktif', 'Arsip Statis', 'Arsip Musnah'));

CREATE TABLE IF NOT EXISTS archive_comments (
  id SERIAL PRIMARY KEY,
  archive_id INTEGER NOT NULL REFERENCES archives(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dispositions (
  id SERIAL PRIMARY KEY,
  archive_id INTEGER NOT NULL REFERENCES archives(id) ON DELETE CASCADE,
  from_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  to_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  to_unit_id INTEGER REFERENCES organization_units(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  deadline DATE NOT NULL,
  status VARCHAR(40) NOT NULL CHECK (status IN ('Dikirim', 'Dibaca', 'Diproses', 'Selesai', 'Dibatalkan')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (to_user_id IS NOT NULL OR to_unit_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS disposition_history (
  id SERIAL PRIMARY KEY,
  disposition_id INTEGER NOT NULL REFERENCES dispositions(id) ON DELETE CASCADE,
  status VARCHAR(40) NOT NULL,
  note TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(80) NOT NULL,
  entity VARCHAR(80) NOT NULL,
  entity_id INTEGER,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_archives_search ON archives USING GIN (
  to_tsvector('simple', title || ' ' || document_number || ' ' || document_type || ' ' || file_type)
);
CREATE INDEX IF NOT EXISTS idx_archives_unit_status_year ON archives(unit_id, status, year);
CREATE INDEX IF NOT EXISTS idx_archives_category ON archives(archive_category);
CREATE INDEX IF NOT EXISTS idx_dispositions_status_deadline ON dispositions(status, deadline);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

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

CREATE INDEX IF NOT EXISTS idx_archive_lifecycle_logs_archive_id ON archive_lifecycle_logs(archive_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

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
