# SOP respons insiden keamanan SIPADI

Dokumen ini harus dicetak/tersedia offline. Isi seluruh placeholder kontak, sistem tiket, pemilik keputusan, RTO, dan RPO sebelum produksi.

## Klasifikasi

| Level | Contoh | Respons awal |
|---|---|---|
| SEV-1 Kritis | kompromi Admin, ransomware, eksfiltrasi/ubah arsip, kunci produksi bocor, layanan publik diambil alih | page tim segera; Incident Commander aktif; containment darurat |
| SEV-2 Tinggi | akses tidak sah terkonfirmasi terbatas, malware upload lolos, brute force berhasil, WAF/origin bypass | respons maksimal 1 jam; batasi akun/host terdampak |
| SEV-3 Sedang | serangan diblokir berulang, salah konfigurasi tanpa bukti kompromi | triase hari yang sama; tingkatkan monitoring |
| SEV-4 Rendah | probe tunggal/false positive/kelemahan hardening | masukkan backlog dan pantau |

Peran minimum: Incident Commander, Security Lead, Technical Lead, Evidence Custodian, Communications/Legal-DPO, dan pemilik layanan. Satu orang boleh merangkap saat tim kecil, tetapi pencatatan bukti dan persetujuan keputusan tetap harus jelas.

## 0–15 menit: validasi dan stabilisasi

1. Buka nomor insiden; catat pelapor, waktu WIB+UTC, alarm awal, hostname, akun, IP, dan request ID.
2. Pastikan alert berasal dari Wazuh/Cloudflare/API asli. Jangan klik URL/payload mencurigakan dari dashboard.
3. Tetapkan level dan Incident Commander. Gunakan kanal komunikasi khusus; anggap email/chat korporat tidak aman bila SSO dicurigai.
4. Lindungi bukti sebelum perubahan: ekspor event Cloudflare/Wazuh, log container/systemd, audit log database, daftar proses/koneksi, dan waktu sistem.
5. Jangan mematikan/reboot host kecuali serangan aktif membahayakan data atau ada keputusan Incident Commander; tindakan itu dapat menghilangkan bukti volatil.

## Containment

- Akun: nonaktifkan user atau naikkan `token_version`, reset MFA lewat Admin lain dengan tiket/alasan, dan cabut sesi. Jangan meminta recovery code korban.
- IP/trafik: blok indikator di Cloudflare/WAF/Fail2ban; bila origin bocor, izinkan hanya IP Cloudflare dan CIDR admin setelah akses console dipastikan.
- Host/container: keluarkan node terdampak dari load balancer, isolasi jaringan, pertahankan disk/log read-only untuk bukti, lalu jalankan instance bersih.
- Secret: jika bocor, rotasi berurutan dari kredensial Cloudflare/AWS/database, JWT, MFA encryption, backup encryption, lalu service account. Simpan kunci lama secara offline selama masih dibutuhkan untuk dekripsi/forensik.
- Malware/ransomware: hentikan write access, jangan memasang backup ke host terdampak, dan jangan membayar/berkomunikasi tanpa keputusan pimpinan dan pihak berwenang.

Setiap perintah/perubahan dicatat dengan pelaksana, waktu, alasan, hasil, dan artefak terkait. Hitung SHA-256 bukti; salinan kerja terpisah dari master; batasi akses berbasis need-to-know.

## Eradikasi dan pemulihan

1. Tentukan root cause, initial access, akun/data terpengaruh, periode kompromi, persistence, dan lateral movement.
2. Patch penyebab, hapus persistence, rebuild dari image/artifact tepercaya, rotasi seluruh secret dalam lingkup, lalu scan ulang.
3. Restore hanya dari snapshot terenkripsi yang autentik dan lebih tua dari waktu kompromi. Lakukan restore rehearsal terisolasi dan verifikasi jumlah data, hash file, login, MFA, akses role/unit, download, audit, ClamAV, WAF, dan alert Wazuh.
4. Kembalikan trafik bertahap dengan monitoring diperketat minimal 72 jam. Tutup containment hanya setelah Security Lead dan pemilik layanan menyetujui.
5. Pemilik data/DPO/Legal menilai kewajiban pemberitahuan kepada pimpinan, subjek data, CSIRT/BSSN, penegak hukum, atau regulator sesuai klasifikasi data dan aturan yang berlaku. Jangan membuat pernyataan publik tanpa persetujuan.

## Pasca-insiden

Dalam 5 hari kerja setelah stabil: susun timeline, dampak, indikator, root cause, kontrol yang gagal/berhasil, biaya/downtime, keputusan komunikasi, dan corrective actions dengan pemilik+tenggat. Retest perbaikan dan perbarui rules Wazuh/Cloudflare, test otomatis, runbook, serta pelatihan.

## Checklist kehilangan perangkat MFA

1. Verifikasi identitas melalui kanal resmi dan tiket; jangan hanya berdasarkan email/chat.
2. Minta Admin yang berbeda dari pemilik akun menjalankan reset MFA dengan password Admin dan alasan minimal 10 karakter.
3. Reset mencabut sesi dan recovery code lama. User login dengan password lalu wajib enroll MFA baru sebelum fitur lain terbuka.
4. Jika ada indikasi pencurian kredensial, reset password dan investigasi audit log sebelum membuka kembali akun.
