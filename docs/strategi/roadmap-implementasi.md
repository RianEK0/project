# Roadmap Implementasi Komdigi HRIS

Roadmap ini dibuat agar pengembangan aplikasi bisa dilakukan bertahap dan realistis.

## Tahap 1: Stabilkan Production

Target:

- aplikasi benar-benar bisa dipakai online dengan aman

Pekerjaan:

- migrasi ke PostgreSQL
- pisahkan environment dev dan production
- aktifkan HTTPS
- pasang rate limiting
- tambahkan validasi upload file
- siapkan backup database
- siapkan restore procedure

Output:

- aplikasi siap untuk pilot internal

## Tahap 2: Rapikan Operasional

Target:

- aplikasi mudah dipantau dan mudah dipelihara

Pekerjaan:

- monitoring health check
- log error terstruktur
- log aktivitas lebih rinci
- restart policy dan process manager
- dokumentasi deployment final

Output:

- aplikasi lebih stabil untuk pemakaian harian

## Tahap 3: Lengkapi Fitur HRIS

Target:

- aplikasi tidak hanya absensi, tetapi menjadi HRIS yang lebih utuh

Pekerjaan:

- modul cuti
- modul izin
- modul sakit
- approval workflow
- status kehadiran lebih lengkap

Output:

- aplikasi lebih relevan untuk kebutuhan administrasi SDM

## Tahap 4: Tingkatkan Keamanan Face Recognition

Target:

- sistem absensi wajah lebih aman dan lebih akurat

Pekerjaan:

- liveness detection
- pengaturan threshold validasi
- reset/re-enroll wajah
- fallback check manual jika wajah gagal terdeteksi

Output:

- absensi wajah lebih siap untuk penggunaan nyata

## Tahap 5: Tambah Laporan dan Analitik

Target:

- pimpinan dan admin mudah membaca performa kehadiran

Pekerjaan:

- rekap bulanan
- statistik keterlambatan
- laporan per direktorat
- laporan per divisi
- export laporan manajemen

Output:

- aplikasi siap mendukung monitoring dan pengambilan keputusan

## Prioritas Waktu

### Jika waktu sangat terbatas

Kerjakan dulu:

1. PostgreSQL
2. HTTPS
3. rate limiting
4. backup

### Jika targetnya presentasi akademik

Kerjakan dulu:

1. dokumentasi lengkap
2. use case
3. ERD
4. flowchart
5. sequence diagram

### Jika targetnya implementasi nyata

Kerjakan dulu:

1. production hardening
2. modul cuti/izin/sakit
3. liveness detection
4. laporan bulanan
