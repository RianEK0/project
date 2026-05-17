# Roadmap Fitur Lanjutan Komdigi HRIS

Dokumen ini berisi fitur-fitur yang sebaiknya ditambahkan agar Komdigi HRIS semakin lengkap sebagai sistem kepegawaian.

## 1. Liveness Detection

### Tujuan

Mencegah absensi palsu menggunakan foto, video, atau rekaman wajah.

### Rekomendasi Implementasi

- blink detection
- head movement challenge
- texture analysis sederhana
- random prompt saat absensi

### Manfaat

- meningkatkan keamanan sistem absensi
- mengurangi spoofing

## 2. Modul Cuti, Izin, dan Sakit

### Fitur

- pengajuan cuti
- pengajuan izin
- pengajuan sakit
- upload lampiran
- riwayat pengajuan

### Status yang Disarankan

- menunggu persetujuan
- disetujui
- ditolak

## 3. Approval Workflow

### Fitur

- atasan atau admin menyetujui pengajuan
- ada alur approval bertingkat
- notifikasi saat pengajuan dibuat atau diproses

## 4. Reset Password

### Fitur

- ubah password
- reset password oleh admin
- forgot password via email

## 5. Rekap Bulanan

### Fitur

- ringkasan kehadiran per bulan
- total hadir
- total terlambat
- total tidak valid
- export laporan bulanan

## 6. Pengaturan Jam Kerja

### Fitur

- jam masuk standar
- batas toleransi terlambat
- jam pulang
- aturan per direktorat atau unit

## 7. Import Pegawai dari Excel

### Fitur

- upload file Excel
- validasi kolom
- preview sebelum import
- import massal user

## 8. Sequence Diagram yang Bisa Ditambahkan

Dokumentasi berikutnya yang masih layak ditambah:

- sequence diagram login
- sequence diagram absensi wajah
- sequence diagram notifikasi

## 9. Prioritas Implementasi

Urutan prioritas yang disarankan:

1. modul cuti/izin/sakit
2. approval workflow
3. liveness detection
4. rekap bulanan
5. pengaturan jam kerja
6. import pegawai dari Excel
