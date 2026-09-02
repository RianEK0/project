# Deployment anti-hack SIPADI

Topologi produksi yang disiapkan:

```text
Internet / Cloudflare
        |
OWASP ModSecurity CRS (WAF + TLS)
        |
Next.js ---- Express API ---- ClamAV
                  |  \
              PostgreSQL  Valkey (state keamanan)
                  |
          Object storage privat + KMS
```

Hanya container WAF yang menerbitkan port host. Web, API, PostgreSQL, Valkey, dan ClamAV tidak dapat menerima koneksi langsung dari internet; API memperoleh jaringan egress khusus untuk object storage dan akses keluarnya wajib dibatasi firewall/platform.

Kontrol tambahan yang sudah disertakan di repo:

- MFA TOTP dan passkey WebAuthn untuk akun, wajib untuk `Admin` dan `Inspektur` di production, dengan recovery code sekali pakai, user verification, dan reset MFA teraudit.
- Cookie sesi `HttpOnly`, `Secure`, `SameSite=Strict` dengan validasi Origin/Fetch Metadata; JWT tidak disimpan oleh JavaScript browser. ID sesi hanya disimpan sebagai hash di database, memiliki inventaris perangkat, dan dapat dicabut segera.
- Idle timeout dan absolute timeout ditegakkan server-side; jumlah sesi aktif dibatasi dan pengguna dapat mencabut satu atau semua perangkat lain dengan konfirmasi password.
- Lockout akun persisten, riwayat password, forced password change, serta WebAuthn step-up untuk reset MFA, unlock akun, pengelolaan akun istimewa, ekspor backup, dan restore. Challenge terikat pada user+sesi+operasi, sekali pakai, dan sesi dirotasi setelah verifikasi.
- Audit log append-only dengan HMAC hash chain dan pemeriksaan integritas, serta endpoint metrics/readiness privat untuk SOC/monitoring.
- Dual approval sekali pakai untuk backup, reset MFA, dan pengelolaan akun istimewa; pemohon dan pejabat penyetuju berbeda serta keduanya memakai passkey.
- Enkripsi AES-256-GCM untuk file tersimpan, SSE-KMS pada object storage privat, verifikasi bucket fail-closed, key rotation, migrasi file lama, serta penolakan plaintext pada production.
- Rate limit dan auto-block terdistribusi melalui Valkey/Redis persisten sehingga konsisten pada beberapa instance dan tidak hilang saat API restart.
- Pencegahan eksfiltrasi dengan counter atomik lintas instance, alert SIEM, hold download/ekspor persisten, dan pelepasan oleh pejabat kedua.
- Backup AES-256-GCM, snapshot offsite S3-compatible, dukungan Object Lock, timer harian, dan restore runbook.
- Baseline Cloudflare, Wazuh decoder/rules, Fail2ban, UFW, Dependabot, CodeQL, audit dependency, serta pemeriksaan mingguan.
- Rencana pentest OWASP dan SOP respons insiden di `deploy/pentest/` dan `deploy/incident-response/`.
- SBOM, provenance, pemindaian container, image bertanda tangan keyless Sigstore, dan verification gate di `deploy/supply-chain/`, serta paket tata kelola/go-live pemerintah di `docs/government/`.

## Menjalankan stack

1. Salin `deploy/security.env.example` menjadi `.env` di root repo untuk commissioning dan ganti seluruh placeholder. Untuk production final, gunakan workload identity serta secret file dari KMS/secret manager sesuai `deploy/secrets/`; jangan menyimpan `.env` production di repository atau image. Setiap fungsi memakai secret berbeda dan key AES wajib tepat 32 byte base64/64 hex.
2. Siapkan bucket dokumen privat dan kunci KMS sesuai `deploy/object-storage/README.md`. Startup production memverifikasi versioning, Public Access Block, serta default SSE-KMS dan gagal tertutup bila kontrol tidak sesuai.
3. Siapkan sertifikat TLS resmi. Image WAF membuat sertifikat self-signed untuk commissioning, tetapi production wajib menaruh `server.crt` dan `server.key` di `deploy/certs/`, lalu memakai `deploy/docker-compose.tls.override.yml.example` sebagai override Compose.
4. Jalankan `npm run security:preflight`. Deployment dihentikan sampai seluruh pemeriksaan environment dan bukti VAPT/WAF/SIEM/EDR/restore/signature lulus; hasil ini tidak menggantikan checklist dan tanda tangan pada `docs/government/GO_LIVE_APPROVAL.md`.
5. Untuk production, isi `API_IMAGE` dan `WEB_IMAGE` dari artifact workflow `Signed Container Release`, lalu verifikasi dengan `deploy/supply-chain/verify-release-images.sh`. Jalankan production dengan override signed-release agar host tidak membangun ulang source dan tidak memakai tag bergerak:

   ```bash
   docker compose -f docker-compose.security.yml -f deploy/docker-compose.tls.override.yml.example -f deploy/docker-compose.signed-release.override.yml.example up -d
   ```

   Perintah build lokal berikut hanya untuk commissioning terkontrol:

   ```bash
   docker compose -f docker-compose.security.yml -f deploy/docker-compose.tls.override.yml.example up -d --build
   ```

6. Terapkan schema sebelum menerima trafik:

   ```bash
   docker compose -f docker-compose.security.yml exec api npm run schema
   ```

7. Enkripsi lalu migrasikan file lama ke object storage sebelum membuka trafik. Jalankan dry-run, pastikan backup tersedia dan tidak ada file `MISSING`, kemudian apply:

   ```bash
   docker compose -f docker-compose.security.yml exec api npm run files:encrypt
   docker compose -f docker-compose.security.yml exec api npm run files:encrypt -- --apply
   docker compose -f docker-compose.security.yml exec api npm run files:migrate-s3
   docker compose -f docker-compose.security.yml exec api npm run files:migrate-s3 -- --apply
   ```

8. Daftarkan passkey minimal dua pejabat berbeda dari role Admin/Inspektur, lalu uji satu operasi dual approval dan satu hold eksfiltrasi. Verifikasi hanya port WAF yang terbuka. Port `3000`, `4000`, `5432`, `6379`, dan `3310` tidak boleh dipublikasikan.

PostgreSQL internal pada Compose menggunakan `DATABASE_SSL_MODE=disable` karena hanya berada di private bridge dan tidak menerbitkan port. Untuk database terkelola/remote, gunakan `DATABASE_SSL_MODE=verify-full` dan isi `DATABASE_SSL_CA_BASE64` dengan CA PEM yang telah di-base64. Mode `require` mengenkripsi tetapi tidak memverifikasi identitas server dan hanya boleh menjadi tahap migrasi terdokumentasi.

ClamAV membutuhkan sekitar 3 GiB RAM minimum dan 4 GiB disarankan. Startup pertama dapat lebih lama karena database signature diunduh ke volume persisten. Selama antivirus belum siap, upload gagal tertutup dengan HTTP 503; data lain tetap dapat digunakan.

## Cloudflare dan DDoS

- Aktifkan proxy Cloudflare, WAF managed rules, bot protection, dan rate limiting pada `/api/auth/login` serta endpoint upload.
- Gunakan mode TLS `Full (strict)` dan Origin Certificate atau sertifikat publik yang valid.
- Batasi firewall origin agar port 80/443 hanya menerima alamat IP Cloudflare bila domain sudah sepenuhnya diproksikan.
- Jangan membuka alamat origin asli lewat DNS publik lain.
- Terapkan baseline dan urutan rollout di `deploy/cloudflare/`; aktivasi memerlukan zone Cloudflare organisasi.

## Firewall host

Script UFW bersifat dry-run secara default. Isi IP/CIDR admin dan port SSH yang benar, tinjau hasilnya, lalu jalankan dengan `--apply`:

```bash
SSH_PORT=22 ADMIN_CIDR=203.0.113.10/32 sh deploy/firewall/apply-ufw.sh
SSH_PORT=22 ADMIN_CIDR=203.0.113.10/32 sh deploy/firewall/apply-ufw.sh --apply
```

Jangan menerapkan aturan firewall sebelum memastikan console/out-of-band access tersedia.

## Fail2ban dan SIEM

API menulis event satu baris dengan prefix `SECURITY_EVENT` sekaligus menyimpannya ke tabel `security_events`. Salin konfigurasi berikut ke host bila API dijalankan sebagai unit systemd:

- `deploy/fail2ban/filter.d/sipadi-security.conf` ke `/etc/fail2ban/filter.d/`
- `deploy/fail2ban/jail.d/sipadi-security.local` ke `/etc/fail2ban/jail.d/`

Sesuaikan `journalmatch` atau `logpath` bila log berasal dari Docker. Kirim log WAF dan API ke Wazuh/SIEM agar perubahan log, brute force, kegagalan passkey step-up, malware upload, dan probe honeypot menghasilkan alert terpusat.

Decoder, rules, dan petunjuk instalasi Wazuh tersedia di `deploy/wazuh/`. Uji setiap perubahan rules dengan `wazuh-logtest` sebelum restart Manager.

## Backup, patch, dan security test

- Aktifkan `sipadi-offsite-backup.timer` dan ikuti `deploy/backup/DR_RUNBOOK.md`. Uji restore terisolasi setiap bulan; sukses upload bukan bukti backup dapat dipulihkan.
- Aktifkan Dependabot, CodeQL/default setup, secret scanning/push protection bila tersedia, dan branch protection yang mewajibkan workflow CI + Security lulus. Workflow passive DAST hanya berjalan bila variable `DAST_ENABLED=true`, secret `DAST_TARGET_URL`, dan secret `DAST_AUTHORIZED=yes` telah ditetapkan oleh pemilik sistem.
- Timer `sipadi-security-maintenance.timer` menjalankan audit dependency dan regresi mingguan. Patch OS ditangani mekanisme resmi distro (misalnya unattended security updates) dengan reboot terjadwal dan rollback image/snapshot.
- Pentest hanya dengan izin tertulis mengikuti `deploy/pentest/OWASP_TEST_PLAN.md`. SOP insiden berada di `deploy/incident-response/SOP.md`.

## Pemeriksaan setelah deploy

```bash
curl -I https://sipadi.example.go.id/login
curl https://sipadi.example.go.id/api/health
docker compose -f docker-compose.security.yml ps
docker compose -f docker-compose.security.yml logs --since=10m waf api clamav
```

Gunakan file uji resmi EICAR untuk memastikan ClamAV menolak upload. Jangan menguji exploit atau pemindaian agresif pada sistem produksi tanpa izin tertulis dan jendela pengujian.

Referensi teknis: [OWASP CRS Docker](https://github.com/coreruleset/modsecurity-crs-docker), [ClamAV Docker](https://docs.clamav.net/manual/Installing/Docker.html), [ClamD INSTREAM](https://docs.clamav.net/manual/Usage/ClamdProtocol.html), dan [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).
