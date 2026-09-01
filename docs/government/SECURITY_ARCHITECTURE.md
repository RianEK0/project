# Arsitektur Keamanan SIPADI

## Sasaran

Melindungi kerahasiaan arsip, integritas alur disposisi dan bukti audit, ketersediaan layanan, serta akuntabilitas seluruh tindakan administratif. Prinsip utama: deny-by-default, least privilege, defense-in-depth, fail-closed untuk kontrol kritis, dan pemisahan jalur publik dari jalur administrasi.

## Zona dan aliran yang disetujui

```text
Internet
  |
  v
DNS/CDN + DDoS + WAF + rate limit
  |
  +--> Portal publik: informasi layanan/kebijakan saja
  |
  +--> Login aplikasi -- HTTPS --> reverse proxy
                                  |
                     +------------+------------+
                     |                         |
                 Web frontend             API privat
                                               |
                          +--------------------+--------------------+
                          |                    |                    |
                     PostgreSQL          Object storage        ClamAV
                     private subnet      AES-GCM + SSE-KMS      private
                          |
                 Redis/Valkey private
                 distributed security state
                          |
                     backup encrypted --> immutable/offsite

API/log host --> agent SIEM/SOC
Prometheus --> /api/internal/metrics (token + allowlist jaringan)
Admin/operator --> identity-aware proxy/VPN + passkey --> endpoint admin
```

Tidak ada database, object storage, ClamAV, metrik, dashboard SIEM, atau SSH yang boleh menerima trafik langsung dari internet. Endpoint `/api/health` hanya mengungkap status minimal; readiness dan metrics berada di jalur internal bertoken dan tetap harus dibatasi firewall/mTLS atau service identity pada production.

## Identitas dan sesi

- Password disimpan dengan bcrypt dan kebijakan minimal; password saat ini serta lima password sebelumnya tidak dapat dipakai ulang. Password seed dilarang di production.
- Role `Admin` dan `Inspektur` wajib passkey pada konfigurasi production; MFA TOTP dapat menjadi faktor tambahan/fallback yang dikelola.
- WebAuthn hanya menggunakan RP ID dan HTTPS origin eksplisit. User verification diwajibkan dan challenge sekali pakai/berumur pendek.
- JWT terikat issuer, audience, algoritma, expiry, token version, ID sesi (`jti`), waktu autentikasi, dan metode autentikasi (`amr`). Database hanya menyimpan hash ID sesi; middleware memeriksa status sesi pada setiap request sehingga pencabutan berlaku segera.
- Pengguna dapat melihat sesi aktif serta mencabut satu atau semua perangkat lain setelah mengonfirmasi password. Perubahan password, role, unit, status akun, reset MFA, serta perubahan passkey mencabut sesi lama.
- Idle timeout 30 menit dan absolute timeout 8 jam ditegakkan server-side secara default; jumlah sesi aktif per akun dibatasi tiga. Nilai final wajib ditetapkan dalam System Security Plan berdasarkan klasifikasi data dan lingkungan perangkat.
- Kegagalan login dan lockout disimpan di database, bukan hanya memori/IP. Operasi sangat sensitif memakai WebAuthn step-up dalam sesi: challenge sekali pakai terikat pada user, sesi aktif, dan nama operasi. Setelah berhasil, sesi lama dicabut, ID sesi baru diterbitkan, dan otorisasi step-up tidak berlaku untuk operasi lain.
- Akun layanan tidak boleh menggunakan akun manusia bersama. Akses darurat memakai akun break-glass individual, disegel, dipantau, dan direview setelah penggunaan.

## Otorisasi dan data

- RBAC diterapkan server-side; UI bukan boundary keamanan.
- Akses arsip mengikuti role, unit, kepemilikan, pinjaman yang disetujui, status, dan tingkat keamanan.
- Dokumen rahasia tidak dapat diunduh lewat alur standar. Setiap pengecualian membutuhkan proses formal, bukan perubahan ad-hoc pada database.
- Upload diverifikasi berdasarkan ukuran, ekstensi, MIME, magic bytes, nama aman, dan malware scan. Production menolak upload bila pemindai wajib tidak tersedia.
- Setelah lolos pemindaian, berkas arsip dan berita acara dienkripsi dengan AES-256-GCM memakai container terautentikasi dan key ID. Preview/download mendekripsi di memori setelah tag autentikasi valid; production menolak berkas plaintext setelah migrasi.
- Download, preview, dan ekspor memiliki pencatatan reservasi atomik per pengguna. Ambang anomali menghasilkan alert, sedangkan ambang blokir membuat hold persisten yang hanya dapat dilepas pejabat Admin/Inspektur lain dengan passkey.
- Secret, key enkripsi, dan token observabilitas berada di secret manager; rotasi mempertahankan key lama hanya selama data terkait masih perlu dibaca/diverifikasi.
- Startup production menolak secret placeholder, secret kurang dari 32 karakter, pemakaian ulang secret lintas fungsi, dan kredensial database development. Koneksi database remote wajib TLS `verify-full` dengan CA tepercaya.
- Secret dapat dibaca dari file hasil mount secret manager (`*_FILE`) agar tidak harus berada pada environment atau image. Workload identity, policy KMS, dan rotasi tetap menjadi tanggung jawab platform production.
- Rate limit, strike, dan blokir IP menggunakan Redis/Valkey berautentikasi pada production. Middleware gagal tertutup dan health menjadi tidak siap bila backend state wajib terputus.
- Dokumen production disimpan pada object storage privat setelah enkripsi aplikasi, kemudian dilapisi SSE-KMS. Startup memverifikasi versioning, Public Access Block, dan default KMS sebelum menerima trafik.

## Integritas dan nonrepudiasi operasional

- Audit log application-level memakai HMAC SHA-256 berantai, key ID, transaksi, dan PostgreSQL advisory lock.
- Ekspor/restore backup, reset MFA, dan perubahan akun istimewa memakai dual control: payload diikat hash, pemohon dan penyetuju wajib berbeda, keputusan memerlukan passkey, tiket kedaluwarsa, dan approval hanya dapat dikonsumsi satu kali.
- Trigger database menolak insert tidak bertanda tangan, cabang rantai yang tidak sah, update, delete, dan truncate.
- Audit dan event keamanan tidak ikut ditimpa oleh restore aplikasi. Ekspor berkala dikirim ke penyimpanan immutable/WORM dan SIEM.
- Hash chain mendeteksi manipulasi; ia tidak menggantikan timestamp tepercaya, WORM, kontrol DBA, ataupun log infrastruktur independen.

## Ketersediaan dan pemulihan

- Minimal dua instance stateless di belakang load balancer untuk target high availability.
- Database memakai backup terenkripsi, point-in-time recovery bila tersedia, replikasi sesuai hasil BIA, dan pengujian restore terjadwal.
- Object storage memakai versioning, retention/immutability, server-side encryption, dan akses service identity terbatas.
- Image API/web dibangun pada CI, dipindai High/Critical, memiliki SBOM/provenance, ditandatangani Sigstore pada digest immutable, dan wajib diverifikasi sebelum promosi.
- RTO/RPO belum boleh dianggap sah sampai BIA, kapasitas, dan simulasi pemulihan disetujui pemilik layanan.

## Keputusan arsitektur yang harus diisi

| Keputusan | Nilai production | Penyetuju | Evidence |
|---|---|---|---|
| Domain publik dan RP ID WebAuthn | `[isi]` | `[isi]` | DNS/TLS scan |
| Lokasi pusat data dan klasifikasi data | `[isi]` | `[isi]` | Kajian data |
| Penyedia WAF/DDoS/IAP | `[isi]` | `[isi]` | Export konfigurasi |
| SIEM/SOC dan retensi log | `[isi]` | `[isi]` | Use case + uji alert |
| KMS/secret manager dan rotasi | `[isi]` | `[isi]` | SOP + log rotasi |
| RTO/RPO | `[isi]` | `[isi]` | BIA + hasil drill |
