# Prioritas Penambahan Komdigi HRIS

Dokumen ini merangkum apa saja yang paling penting ditambahkan berikutnya.

## Prioritas 1: Siap Dipakai Publik

Fokus utama:

- migrasi database ke `PostgreSQL`
- aktifkan HTTPS
- rate limiting
- validasi upload file
- backup dan restore
- hardening environment production

Alasan:

- aplikasi bisa online belum tentu aman dipakai publik
- fondasi production harus kuat sebelum user bertambah banyak

## Prioritas 2: HRIS Lebih Lengkap

Fitur yang perlu ditambahkan:

- cuti
- izin
- sakit
- approval atasan
- rekap bulanan
- laporan per pegawai/divisi/direktorat

Alasan:

- HRIS biasanya tidak berhenti di pegawai dan absensi
- modul administrasi SDM perlu dilengkapi agar lebih berguna

## Prioritas 3: Keamanan Absensi Wajah

Fitur yang perlu ditambahkan:

- liveness detection
- threshold face matching yang dapat diatur
- fallback absensi jika kamera gagal
- reset data wajah

Alasan:

- face recognition tanpa anti-spoofing masih rentan
- user nyata akan menemui kondisi kamera, cahaya, dan wajah yang beragam

## Prioritas 4: Operasional dan Monitoring

Yang perlu ditambahkan:

- log monitoring terpusat
- alert jika backend error
- dashboard kesehatan sistem
- audit log yang lebih detail

Alasan:

- ketika aplikasi mulai dipakai nyata, masalah operasional jadi sangat penting

## Urutan Rekomendasi

Urutan terbaik menurut saya:

1. `PostgreSQL + HTTPS + hardening`
2. `Backup + monitoring`
3. `Modul cuti/izin/sakit + approval`
4. `Liveness detection`
5. `Laporan dan rekap bulanan`
