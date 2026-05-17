# Skenario Pengujian Komdigi HRIS

## Tujuan

Dokumen ini berisi skenario pengujian utama agar aplikasi dapat divalidasi secara fungsional.

## 1. Pengujian Login

### Skenario 1

- Input email dan password benar
- Hasil yang diharapkan: user berhasil login dan masuk ke dashboard

### Skenario 2

- Input password salah
- Hasil yang diharapkan: sistem menampilkan pesan error login

## 2. Pengujian Role Access

### Skenario 3

- Login sebagai Super Admin
- Hasil yang diharapkan: dapat melihat semua pegawai dan semua absensi

### Skenario 4

- Login sebagai Admin Direktorat
- Hasil yang diharapkan: hanya melihat pegawai di direktorat sendiri

### Skenario 5

- Login sebagai Pegawai
- Hasil yang diharapkan: hanya dapat melihat profil dan absensinya sendiri

## 3. Pengujian CRUD Pegawai

### Skenario 6

- Tambah pegawai dengan data valid
- Hasil yang diharapkan: data pegawai tersimpan

### Skenario 7

- Edit pegawai
- Hasil yang diharapkan: data berubah sesuai input baru

### Skenario 8

- Hapus pegawai
- Hasil yang diharapkan: data pegawai hilang dari daftar

## 4. Pengujian Absensi Wajah

### Skenario 9

- User melakukan enrollment wajah
- Hasil yang diharapkan: descriptor wajah tersimpan

### Skenario 10

- User melakukan absen masuk dengan wajah valid
- Hasil yang diharapkan: absensi tersimpan dengan status valid

### Skenario 11

- User melakukan absen masuk dengan descriptor tidak cocok
- Hasil yang diharapkan: absensi tersimpan dengan status tidak valid

### Skenario 12

- User mencoba check-in dua kali di hari yang sama
- Hasil yang diharapkan: sistem menolak check-in kedua

### Skenario 13

- User melakukan absen pulang tanpa check-in hari itu
- Hasil yang diharapkan: sistem menolak check-out

## 5. Pengujian Riwayat dan Export

### Skenario 14

- Filter absensi berdasarkan tanggal
- Hasil yang diharapkan: data yang tampil sesuai rentang tanggal

### Skenario 15

- Export Excel/PDF/CSV
- Hasil yang diharapkan: file berhasil diunduh dengan isi yang sesuai

## 6. Pengujian Notifikasi

### Skenario 16

- User belum absen hari ini
- Hasil yang diharapkan: muncul pengingat absensi

### Skenario 17

- Ada absensi tidak valid
- Hasil yang diharapkan: admin menerima notifikasi warning

## 7. Pengujian Activity Log

### Skenario 18

- Admin membuat pegawai baru
- Hasil yang diharapkan: activity log tercatat

### Skenario 19

- User update profil sendiri
- Hasil yang diharapkan: activity log tercatat

## 8. Rekomendasi Pengujian Tambahan

- pengujian UI responsive di mobile dan desktop
- pengujian performa kamera
- pengujian upload file besar
- pengujian token kadaluarsa
- pengujian akses route terproteksi
