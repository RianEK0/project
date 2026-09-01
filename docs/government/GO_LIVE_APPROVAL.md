# Gerbang dan Persetujuan Go-Live SIPADI

Status akhir hanya `DISETUJUI`, `DITOLAK`, atau `DISETUJUI DENGAN RISIKO RESIDUAL`. Semua placeholder dan bukti wajib diisi; keberadaan kode bukan bukti bahwa konfigurasi production sudah aktif.

## Identitas rilis

| Item | Nilai |
|---|---|
| Nama/owner layanan | `[isi]` |
| Lingkungan/domain/RP ID | `[isi]` |
| Tag, commit, checksum artefak | `[isi]` |
| Nomor perubahan dan waktu rilis | `[isi]` |
| Klasifikasi data tertinggi | `[isi]` |
| RTO/RPO yang disahkan | `[isi]` |
| Rollback version dan trigger | `[isi]` |

## Gerbang wajib

- [ ] Scope, owner, RACI, arsitektur, inventaris aset/data/vendor, serta register risiko disetujui.
- [ ] Kajian hukum, register pemrosesan, DPIA bila diperlukan, JRA/legal hold, kebijakan privasi dan syarat layanan mendapat persetujuan pejabat berwenang.
- [ ] DNS, TLS, WAF/DDoS, firewall, IAP/VPN admin, segmentasi, database/storage private, dan secret manager diverifikasi dari production.
- [ ] Semua akun seed/default dihapus; role dan unit pengguna awal disetujui; minimal dua pejabat berbeda (Admin/Inspektur) telah mendaftarkan passkey; break-glass diuji.
- [ ] Idle/absolute timeout dan batas sesi aktif disahkan dalam System Security Plan; uji membuktikan sesi idle, sesi yang dicabut, serta sesi tertua di atas batas tidak dapat dipakai kembali.
- [ ] WebAuthn step-up diuji memakai passkey/perangkat production untuk ekspor, restore, pengelolaan akun istimewa, reset MFA, dan unlock; bukti negatif menunjukkan challenge dari operasi/sesi lain serta cookie sebelum rotasi ditolak.
- [ ] Dual approval diuji end-to-end: pemohon tidak dapat menyetujui sendiri, hash payload berubah saat permintaan berubah, tiket kedaluwarsa ditolak, dan tiket yang sudah dipakai tidak dapat digunakan ulang.
- [ ] Migrasi enkripsi seluruh berkas lama selesai tanpa `MISSING`; sampling membuktikan storage tidak berisi plaintext, file termodifikasi ditolak, dan `ALLOW_PLAINTEXT_STORED_FILES=false`.
- [ ] Ambang eksfiltrasi disahkan pemilik data dan diuji termasuk request paralel, alert SIEM, hold persisten, larangan self-release, serta pelepasan oleh pejabat kedua.
- [ ] Semua secret production unik per fungsi dan berasal dari secret manager; database remote memakai TLS `verify-full` dengan CA tepercaya atau pengecualian jaringan privat telah disetujui dan didokumentasikan.
- [ ] Rate limit dan blokir memakai Redis/Valkey terdistribusi berautentikasi; uji dua instance membuktikan counter/blokir konsisten dan health menjadi gagal tertutup saat backend keamanan terputus.
- [ ] Bucket dokumen memblokir akses publik, versioning aktif, default SSE-KMS aktif, workload tidak memiliki administrasi bucket/KMS, dan seluruh referensi file lama telah bermigrasi ke `s3:` tanpa `MISSING`.
- [ ] CI, dependency audit, CodeQL, repo-native secret/config scan, passive DAST berizin, test, lint, build, SBOM, checksum, dan attestation lulus untuk commit yang sama.
- [ ] Image API/web dipindai tanpa temuan High/Critical, ditandatangani Sigstore, diverifikasi pada digest immutable sebelum deployment, dan host production tidak membangun ulang source.
- [ ] `npm run security:preflight` lulus menggunakan environment production final tanpa mencetak nilai secret.
- [ ] VAPT independen mencakup web/API/auth/WebAuthn/otorisasi/upload/logic; tidak ada Critical/High terbuka.
- [ ] Malware scanner berjalan fail-closed dan object storage privat/versioned/immutable sesuai kebijakan.
- [ ] SIEM menerima log dan alert sintetis; audit chain valid; salinan evidence keluar dari host aplikasi.
- [ ] Backup terenkripsi/offsite/immutable berhasil dan full restore drill memenuhi RTO/RPO.
- [ ] Load/capacity test, accessibility test, browser/device support, monitoring, on-call, dan status page telah diuji.
- [ ] SOP insiden, komunikasi krisis, pelanggaran data, DR, patch, akses, vendor, dan perubahan telah dilatih/tabletop.
- [ ] Rollback telah diuji tanpa menghapus audit/security evidence dan masa observasi pascarilis ditetapkan.

## Stop-ship otomatis

- Critical/High vulnerability terbuka atau bukti test bukan dari commit rilis.
- Audit integrity tidak valid, backup/restore belum terbukti, atau SIEM/scanner kontrol kritis tidak tersedia.
- Secret/key production berada di source, chat, tiket umum, atau belum dirotasi setelah paparan.
- Domain/origin WebAuthn belum final, TLS tidak valid, database/storage/admin endpoint terbuka ke internet.
- Kebijakan publik memakai placeholder, tidak disetujui, atau kontak insiden tidak aktif.
- Owner risiko, data, operasi, dan incident commander belum ditetapkan.

## Persetujuan

| Peran | Nama | Keputusan | Tanggal/waktu | Tanda tangan/evidence ID |
|---|---|---|---|---|
| Pemilik layanan | `[isi]` | `[isi]` | `[isi]` | `[isi]` |
| Pemilik data/PPDP | `[isi]` | `[isi]` | `[isi]` | `[isi]` |
| Security lead/CSIRT | `[isi]` | `[isi]` | `[isi]` | `[isi]` |
| Infrastruktur/operasi | `[isi]` | `[isi]` | `[isi]` | `[isi]` |
| SPBE/SMKI | `[isi]` | `[isi]` | `[isi]` | `[isi]` |
| Unit hukum/kepatuhan | `[isi]` | `[isi]` | `[isi]` | `[isi]` |
| Release manager | `[isi]` | `[isi]` | `[isi]` | `[isi]` |

## Risiko residual

| ID risiko | Deskripsi/dampak | Kontrol kompensasi | Owner | Tenggat | Penyetuju |
|---|---|---|---|---|---|
| `[isi]` | `[isi]` | `[isi]` | `[isi]` | `[isi]` | `[isi]` |

Persetujuan berakhir bila scope/data/vendor/arsitektur berubah material, ditemukan insiden/kerentanan kritis, atau masa berlaku review yang ditetapkan organisasi telah lewat.
