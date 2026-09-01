# Runbook Operasi Keamanan SIPADI

## Awal shift/harian

1. Verifikasi availability dari luar dan readiness dari jaringan internal.
2. Tinjau alert Critical/High, login gagal, pemblokiran IP, hold eksfiltrasi, approval kritis tertunda, perubahan akun/role/MFA, ekspor massal, malware, dan error backup.
3. Pastikan pengiriman log ke SIEM memiliki heartbeat dan selisih waktu host berada dalam toleransi NTP organisasi.
4. Konfirmasi backup terakhir berhasil, terenkripsi, tersalin offsite/immutable, dan ukuran/checksum masuk rentang wajar.
5. Pastikan Redis/Valkey security state sehat dan tidak dapat diakses dari jaringan publik; lonjakan memory/eviction, restart, atau kegagalan AOF menjadi alert.
6. Jalankan synthetic check object storage dari jalur resmi dan pastikan startup/readiness terakhir memverifikasi versioning, Public Access Block, serta SSE-KMS.
7. Buat tiket untuk anomali; jangan menghapus atau mengubah bukti audit.

## Mingguan

- Tinjau dashboard error/latency/saturasi, kapasitas database/storage, antrean scanner, sertifikat dan secret yang akan kedaluwarsa.
- Triage dependency/CodeQL/secret scanning dan patch OS/container. Critical/High mengikuti SLA organisasi.
- Verifikasi digest dan tanda tangan Cosign image yang sedang berjalan sama dengan artifact rilis; jangan membandingkan tag saja.
- Cocokkan head hash audit aplikasi dengan salinan yang disimpan di WORM/SIEM.
- Uji restore kecil pada environment terisolasi dan verifikasi file, database, hak akses, serta checksum.
- Tinjau akun dormant, akun terkunci, passkey role wajib, dan aktivitas break-glass.
- Tinjau sesi aktif yang tidak dikenal, pencabutan/rotasi sesi, pembukaan lockout, serta event `PASSKEY_STEP_UP_FAILED`. Korelasikan nama operasi, user, IP, dan sesi sebelum menutup alert.
- Tinjau tiket dual approval yang rejected/expired dan seluruh pelepasan hold eksfiltrasi. Pastikan pemohon, penyetuju, dan pelepas adalah individu berbeda bila diwajibkan.
- Pantau `SESSION_EXPIRED`, reuse sesi yang dicabut, dan pencabutan akibat `concurrent_session_limit`; lonjakan dapat menunjukkan credential sharing atau pengambilalihan akun.

## Bulanan/triwulanan

- Rotasi kredensial sesuai kebijakan; rotasi key memakai prosedur dual control dan mencatat key ID lama/baru. Key ID audit baru wajib unik, sedangkan key lama dimasukkan ke `AUDIT_PREVIOUS_SIGNING_KEYS` sampai seluruh retensi bukti terkait berakhir.
- Untuk rotasi berkas, masukkan key lama ke `FILE_PREVIOUS_ENCRYPTION_KEYS`, tetapkan key/key ID baru, jalankan `npm run files:encrypt --workspace @sipadi/api -- --rotate --apply` dalam maintenance window, sampling hasil, lalu keluarkan key lama hanya setelah seluruh file dan backup relevan tervalidasi.
- Recertification akses oleh atasan/pemilik data; hapus privilege yang tidak diperlukan dan verifikasi revokasi sesi.
- Simulasikan satu skenario insiden dan satu skenario pemulihan. Catat RTO/RPO aktual, gap, owner, dan tenggat.
- Perbarui threat/risk/vendor/asset register dan uji rule WAF/SIEM dengan request sintetis yang aman.

## Triage alert

| Severity | Contoh | Tindakan awal |
|---|---|---|
| Critical | Eksfiltrasi aktif, ransomware, key production bocor, admin takeover | Aktifkan incident commander/CSIRT, containment terkontrol, preservasi bukti, jalur komunikasi darurat |
| High | Malware upload, bypass akses, banyak login passkey gagal, audit integrity gagal | Triage segera, batasi akun/sumber, snapshot bukti, eskalasi security lead |
| Medium | Probe berulang, perubahan role sah tetapi tidak biasa, error scanner sementara | Validasi konteks, korelasikan SIEM, buat tiket dan pantau |
| Low | Probe tunggal/404 tidak biasa | Agregasi, tuning, eskalasi bila pola meningkat |

Jangan memblokir alamat luas, mematikan sistem, memulihkan backup, atau merotasi key tanpa menilai dampak dan otorisasi insiden. Untuk ancaman aktif, containment darurat tetap mengikuti matriks kewenangan yang disahkan.

## Audit integrity gagal

1. Hentikan perubahan administratif non-darurat; jangan mencoba memperbaiki baris database.
2. Rekam waktu, request ID, head hash, key ID, hasil `/api/audit-logs/integrity`, log database, dan identitas pemeriksa.
3. Bandingkan dengan salinan WORM/SIEM serta backup sebelum kejadian.
4. Periksa ketersediaan key lama lebih dulu; `signing_key_unavailable` dapat menunjukkan salah konfigurasi rotasi, bukan otomatis manipulasi.
5. Aktifkan prosedur insiden bila mismatch terkonfirmasi. Pemulihan bukti hanya dari sumber forensik yang disetujui dan selalu menghasilkan catatan baru.

## Backup/restore

- Backup otomatis harus menggunakan akun hanya-baca yang sesuai, key dari secret manager, jaringan keluar ke bucket terbatas, versioning/object lock, serta alert kegagalan.
- Restore dilakukan pada host/akun terpisah. Validasi malware, autentikasi AES-GCM, format, schema, jumlah record, relasi, akses role, dan audit trail.
- Audit log dan security event production tidak ditimpa restore aplikasi. Rekonsiliasi data dan catat gap waktu berdasarkan log independen.
- Drill dinyatakan lulus hanya bila layanan fungsional, target BIA terpenuhi, dan berita acara disetujui.

## Akses darurat

Break-glass membutuhkan alasan/tiket, persetujuan dua pihak bila tersedia, sesi direkam/diaudit, durasi terbatas, dan password/passkey dirotasi setelah digunakan. Review dilakukan paling lambat hari kerja berikutnya. Dilarang memakai akun bersama tanpa atribusi individual.

## Akun terkunci dan sesi mencurigakan

1. Verifikasi identitas pemilik akun melalui prosedur helpdesk yang disahkan; jangan menerima permintaan hanya berdasarkan email/chat dari akun yang sama.
2. Korelasikan waktu, IP, user-agent, event login, WAF, dan SIEM. Untuk indikasi kompromi, containment lebih didahulukan daripada membuka akun.
3. Admin yang membuka lockout wajib menyelesaikan passkey step-up khusus `unlock-account`, mengisi alasan minimal, dan memastikan audit `PASSKEY_STEP_UP_SUCCESS` serta `ACCOUNT_UNLOCKED` tercatat. ID sesi sebelum step-up harus berstatus `passkey_step_up_rotation`.
4. Pemilik akun dapat mencabut satu atau semua sesi lain dari Pengaturan setelah mengonfirmasi password. Perubahan password, MFA/passkey, role, unit, atau status akun juga mencabut sesi terkait.
5. Jika cookie yang sudah dicabut dipakai kembali, perlakukan event reuse sebagai sinyal berisiko tinggi dan lakukan triage perangkat/sumbernya.
6. Idle timeout normal dicatat sebagai `SESSION_EXPIRED` berseverity rendah. Jangan menaikkan insiden kecuali terjadi pola berulang, sumber tidak dikenal, atau diikuti reuse sesi.
