# Komdigi HRIS

Aplikasi web manajemen pegawai untuk Komdigi (Kementerian Komunikasi dan Digital) dengan arsitektur modular, RBAC, dashboard dinamis per direktorat, absensi berbasis face recognition, notifikasi, dan audit log.

## Fitur Utama

- Login email/password dengan JWT session.
- Role-based access control:
  - `Super Admin`
  - `Admin Direktorat`
  - `Pegawai`
- Struktur organisasi:
  - Direktorat
  - Divisi di dalam direktorat
- Manajemen pegawai:
  - tambah
  - edit
  - hapus
  - detail pegawai
  - upload foto profil
  - pencarian pegawai
- Dashboard dinamis:
  - total pegawai
  - hadir hari ini
  - belum hadir
  - grafik kehadiran 7 hari
  - ringkasan per divisi
  - aktivitas terkini
  - notifikasi
- Absensi wajah:
  - enrollment descriptor wajah
  - check-in
  - check-out
  - validasi descriptor wajah dengan `face-api.js`
  - simpan waktu, foto capture, status validasi
  - dukungan kamera browser dan geolokasi
- Riwayat absensi:
  - filter tanggal
  - filter direktorat
  - filter divisi
  - filter status
  - export `PDF`, `Excel`, dan `CSV`
- Notifikasi sistem:
  - pengingat belum absen
  - alert absensi tidak valid
  - alert perubahan data penting
- Log aktivitas user untuk audit trail.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: SQLite + Prisma ORM
- Face Recognition: `face-api.js`
- Export: `xlsx`, `jspdf`, `jspdf-autotable`

## Struktur Folder

```text
komdigi-hris/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── utils/
│   └── uploads/
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── pages/
    │   └── utils/
```

## Setup Backend

```bash
cd komdigi-hris/backend
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
npm start
```

Backend berjalan di `http://localhost:5001`.

## Setup Frontend

```bash
cd komdigi-hris/frontend
npm install
npm run dev
```

Frontend default berjalan di `http://localhost:5173`.

Jika ingin mengganti URL backend, buat file `.env` di folder `frontend`:

```bash
VITE_API_URL=http://localhost:5001/api
```

Atau salin dari:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

## Akun Demo

- Super Admin
  - Email: `admin@komdigi.go.id`
  - Password: `admin123`
- Admin Direktorat
  - Contoh: `admin.aptika@komdigi.go.id`
  - Password: `admin123`
- Pegawai
  - Contoh: `pegawai1.aptika@komdigi.go.id`
  - Password: `admin123`

## Hak Akses

- `Super Admin`
  - akses semua data
  - kelola semua pegawai
  - lihat dashboard global
- `Admin Direktorat`
  - akses dashboard direktorat sendiri
  - hanya melihat dan mengelola pegawai di direktoratnya
- `Pegawai`
  - melihat dashboard scope pribadi
  - melihat dan mengubah profil sendiri
  - melakukan absensi dan melihat riwayat sendiri

## Endpoint Inti

- Auth
  - `POST /api/auth/login`
  - `GET /api/auth/me`
- Organisasi
  - `GET /api/org/roles`
  - `GET /api/org/direktorats`
  - `GET /api/org/stats`
- Pegawai
  - `GET /api/users`
  - `GET /api/users/:id`
  - `POST /api/users`
  - `PUT /api/users/:id`
  - `DELETE /api/users/:id`
  - `PUT /api/users/me/profile`
  - `POST /api/users/me/enroll-face`
- Absensi
  - `GET /api/attendance`
  - `GET /api/attendance/summary`
  - `GET /api/attendance/reminder`
  - `GET /api/attendance/export`
  - `POST /api/attendance/check-in`
  - `POST /api/attendance/check-out`
- Notifikasi
  - `GET /api/notifications`
  - `PUT /api/notifications/:id/read`
- Audit
  - `GET /api/activity`

## Verifikasi yang Sudah Dicek

- `npx prisma generate`
- `npx prisma db push`
- `node prisma/seed.js`
- `npm run build` pada frontend
- smoke test login dan endpoint organisasi

## Publish Online

Versi saat ini sudah bisa dipublikasikan dengan dua pola:

- `Frontend + backend dipisah`
- `Single service`, yaitu backend melayani API sekaligus file frontend hasil build

Untuk cara cepat publish di satu server:

```bash
docker compose -f docker-compose.production.yml up --build -d
```

Lalu buka:

```text
http://localhost:5001
```

Health check:

```text
http://localhost:5001/healthz
```

## Dokumentasi Tambahan

Dokumentasi lengkap tersedia di:

- [docs/README.md](./docs/README.md)

## Catatan

- Face recognition saat ini memakai descriptor matching di browser menggunakan `face-api.js`.
- Liveness detection seperti blink detection belum diaktifkan; struktur aplikasi sudah siap untuk ditambah di alur absensi bila diperlukan.
- Database default memakai SQLite agar cepat dijalankan lokal. Jika dibutuhkan, skema Prisma dapat dipindah ke MySQL/PostgreSQL.
