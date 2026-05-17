# Penjelasan Aplikasi Komdigi HRIS

## Apa Itu Aplikasi Ini

Komdigi HRIS adalah aplikasi web manajemen pegawai untuk Kementerian Komunikasi dan Digital yang dipakai untuk mengelola data pegawai, struktur organisasi, absensi berbasis wajah, notifikasi, dan dashboard operasional dalam satu sistem terintegrasi.

Aplikasi ini dirancang agar setiap user memiliki akses sesuai peran dan unit organisasinya. Dengan begitu, data pegawai dan absensi bisa dikelola lebih aman, terstruktur, dan efisien.

## Tujuan Aplikasi

- Memusatkan data pegawai Komdigi dalam satu platform.
- Mengatur hak akses berdasarkan role.
- Menampilkan dashboard yang berbeda sesuai direktorat.
- Mendukung absensi digital berbasis pengenalan wajah.
- Menyediakan riwayat absensi yang dapat difilter dan diexport.
- Menyimpan notifikasi dan log aktivitas untuk monitoring.

## Role Dalam Sistem

### 1. Super Admin

Super Admin memiliki akses penuh ke seluruh data dalam sistem. Role ini dapat:

- Melihat semua pegawai dari semua direktorat.
- Menambah, mengubah, menghapus, dan melihat detail pegawai.
- Melihat seluruh data absensi.
- Mengakses dashboard global.
- Melihat notifikasi dan activity log sistem.

### 2. Admin Direktorat

Admin Direktorat hanya dapat mengelola data pada direktoratnya sendiri. Role ini dapat:

- Melihat pegawai dalam direktoratnya.
- Menambah, mengubah, dan menghapus pegawai dalam scope direktoratnya.
- Melihat dashboard direktorat.
- Melihat riwayat absensi pegawai di direktoratnya.

### 3. Pegawai

Pegawai memiliki akses terbatas hanya pada data pribadi. Role ini dapat:

- Melihat profil sendiri.
- Mengubah profil sendiri.
- Melakukan enroll wajah.
- Melakukan absen masuk dan absen pulang.
- Melihat riwayat absensi pribadi.

## Modul Utama Aplikasi

### 1. Login dan Autentikasi

User login menggunakan email dan password. Setelah berhasil login, sistem membaca token autentikasi dan menentukan hak akses berdasarkan role user.

### 2. Struktur Organisasi

Setiap user terhubung ke:

- 1 Direktorat
- 1 Divisi

Struktur ini dipakai untuk membatasi data yang boleh diakses oleh masing-masing user.

### 3. Manajemen Pegawai

Modul ini dipakai untuk:

- tambah pegawai
- edit pegawai
- hapus pegawai
- lihat detail pegawai
- upload foto profil
- pencarian pegawai

Data pegawai mencakup:

- nama lengkap
- email
- jabatan
- role
- direktorat
- divisi
- foto profil

### 4. Dashboard Dinamis

Dashboard menyesuaikan dengan direktorat user. Beberapa elemen yang ditampilkan:

- total pegawai
- jumlah hadir hari ini
- jumlah belum hadir
- grafik kehadiran
- data per divisi
- aktivitas terkini
- notifikasi

Warna tema juga dapat berubah berdasarkan direktorat.

### 5. Absensi dengan Face Recognition

Absensi dilakukan melalui kamera browser. Sistem mengambil gambar wajah, lalu mendeteksi dan membandingkan descriptor wajah dengan data yang sudah disimpan saat enrollment.

Jika cocok:

- absensi disimpan sebagai valid

Jika tidak cocok:

- absensi tetap tercatat
- status disimpan sebagai tidak valid
- admin dapat menerima notifikasi error absensi

Data yang disimpan saat absensi:

- waktu masuk
- waktu pulang
- foto hasil capture
- status absensi
- validasi wajah
- lokasi jika tersedia

### 6. Riwayat Absensi

Riwayat absensi bisa ditampilkan dalam tabel dan difilter berdasarkan:

- tanggal
- direktorat
- divisi
- status

Riwayat juga dapat diexport ke:

- PDF
- Excel
- CSV

### 7. Notifikasi

Sistem menampilkan notifikasi untuk:

- pengingat belum absen
- absensi tidak valid
- perubahan data tertentu

### 8. Activity Log

Setiap aktivitas penting dicatat, misalnya:

- membuat pegawai
- mengubah pegawai
- menghapus pegawai
- update profil
- enroll wajah
- check-in
- check-out

## Teknologi yang Digunakan

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: SQLite + Prisma ORM
- Face Recognition: face-api.js
- Export data: xlsx, jsPDF

## Kesimpulan

Aplikasi Komdigi HRIS adalah sistem informasi kepegawaian berbasis web yang membantu Komdigi mengelola pegawai, struktur organisasi, dan absensi secara modern. Dengan RBAC, dashboard dinamis, dan face recognition, aplikasi ini cocok digunakan sebagai fondasi sistem internal manajemen pegawai yang aman dan terintegrasi.
