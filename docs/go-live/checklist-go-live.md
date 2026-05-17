# Checklist Go-Live Komdigi HRIS

Dokumen ini dipakai untuk menilai apakah aplikasi sudah siap dipublikasikan dan digunakan oleh user nyata.

## 1. Infrastruktur

- Domain sudah tersedia.
- HTTPS sudah aktif.
- Backend berjalan stabil di server production.
- Frontend build production berhasil dilayani dari domain utama.
- Endpoint health check `/healthz` merespons normal.
- Folder `uploads` dapat diakses dan tersimpan dengan benar.

## 2. Database

- Database production sudah memakai `PostgreSQL` atau `MySQL`.
- Data seed admin sudah tersedia.
- Backup database otomatis sudah disiapkan.
- Prosedur restore database sudah diuji.

## 3. Keamanan

- `JWT_SECRET` sudah diganti dengan secret yang kuat.
- `CORS_ORIGIN` sudah dibatasi ke domain production.
- Validasi input aktif untuk endpoint penting.
- Upload file dibatasi tipe dan ukurannya.
- Rate limiting login dan API sensitif sudah diterapkan.
- Error server tidak membocorkan informasi sensitif.

## 4. Fungsional Utama

- Login berhasil.
- Logout berhasil.
- Dashboard tampil normal sesuai role.
- Super Admin bisa melihat semua data.
- Admin Direktorat hanya melihat data direktoratnya.
- Pegawai hanya melihat data sendiri.
- CRUD pegawai berjalan normal.
- Upload foto profil berjalan normal.
- Enrollment wajah berjalan normal.
- Absen masuk berjalan normal.
- Absen pulang berjalan normal.
- Riwayat absensi dapat difilter.
- Export PDF/Excel/CSV berhasil.
- Notifikasi tampil normal.
- Activity log tercatat.

## 5. Uji Browser dan Device

- Aplikasi berjalan di Chrome.
- Aplikasi berjalan di Edge.
- Kamera browser dapat diakses saat HTTPS aktif.
- Tampilan desktop rapi.
- Tampilan mobile tetap usable.

## 6. Uji Operasional

- Aplikasi tetap berjalan setelah restart server.
- Log error dapat dipantau.
- Jika backend mati, ada prosedur restart yang jelas.
- File upload tidak hilang setelah restart container/server.

## 7. Status Kesiapan

### Siap Demo

Jika:

- fitur utama berjalan
- masih memakai SQLite
- masih dipakai untuk internal testing atau demo

### Siap Pilot Internal

Jika:

- fitur stabil
- role access benar
- HTTPS aktif
- backup sudah ada
- monitoring dasar sudah ada

### Siap Publik / Produksi Nyata

Jika:

- database production sudah dipakai
- keamanan production sudah diterapkan
- backup dan recovery sudah diuji
- rate limiting dan validasi file aktif
- performa dan stabilitas sudah diuji
