# Paket Kesiapan Produksi Pemerintah SIPADI

Paket ini adalah baseline tata kelola dan bukti teknis untuk proses persetujuan internal. Dokumen ini **bukan pernyataan sertifikasi atau kepatuhan otomatis**. Inspektorat, Diskominfo, unit hukum, pengelola SPBE, pejabat pelindungan data, dan BSSN/CSIRT terkait tetap harus menilai ruang lingkup, risiko, infrastruktur, dan bukti operasi aktual.

## Dokumen pengendali

| Dokumen | Kegunaan | Pemilik yang disarankan |
|---|---|---|
| [Arsitektur Keamanan](SECURITY_ARCHITECTURE.md) | Zona, aliran data, trust boundary, kontrol aplikasi | Arsitek/Tim TIK |
| [Threat Model](THREAT_MODEL.md) | Ancaman, abuse case, mitigasi, risiko residual | Security lead |
| [Matriks ISMS dan SPBE](ISMS_SPBE_CONTROL_MATRIX.md) | Pemetaan kontrol ke bukti dan penanggung jawab | Koordinator SPBE/SMKI |
| [Tata Kelola Data dan Privasi](DATA_GOVERNANCE_PRIVACY.md) | Klasifikasi, tujuan, akses, retensi, hak subjek data | Pemilik data/PPDP |
| [Runbook Operasi](OPERATIONS_RUNBOOK.md) | Operasi rutin, alert, backup, akses darurat, pemulihan | Tim operasi/SOC |
| [Persetujuan Go-Live](GO_LIVE_APPROVAL.md) | Gerbang rilis dan tanda tangan akuntabilitas | Pemilik layanan |

Dokumen operasional tambahan tersedia pada `deploy/incident-response`, `deploy/backup`, `deploy/pentest`, `deploy/cloudflare`, `deploy/wazuh`, dan `deploy/supply-chain`.

## Dasar acuan yang harus diverifikasi unit hukum

- Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.
- Peraturan Pemerintah Nomor 71 Tahun 2019 tentang Penyelenggaraan Sistem dan Transaksi Elektronik.
- Peraturan Presiden Nomor 95 Tahun 2018 tentang Sistem Pemerintahan Berbasis Elektronik.
- Peraturan BSSN Nomor 4 Tahun 2021 tentang Pedoman Manajemen Keamanan Informasi SPBE dan standar teknis/prosedur keamanan SPBE.
- Peraturan BSSN Nomor 8 Tahun 2020 tentang Sistem Pengamanan dalam Penyelenggaraan Sistem Elektronik.
- Kebijakan kearsipan, Jadwal Retensi Arsip (JRA), klasifikasi keamanan dan akses arsip, serta kebijakan internal instansi yang berlaku.

Nomor versi, tanggal berlaku, perubahan regulasi, dan kewajiban sektoral wajib dikonfirmasi sebelum persetujuan. Simpan hasil kajian hukum sebagai evidence terpisah.

## Status implementasi

Kode menyediakan RBAC, pembatasan akses unit, MFA TOTP/recovery, passkey WebAuthn untuk role istimewa, dual approval operasi kritis, revokasi sesi, validasi/pemindaian/enkripsi upload, object storage privat berlapis KMS, state rate-limit/blokir terdistribusi, pencegahan eksfiltrasi atomik, backup terenkripsi, event keamanan, WAF/SIEM template, metrik privat, audit log append-only dengan hash chain, portal kebijakan publik, dependency/config/DAST/container scanning, SBOM, provenance, dan image bertanda tangan Sigstore.

Hal berikut tidak dapat diselesaikan oleh source code dan menjadi gerbang eksternal: inventaris data nyata, DPIA/kajian dampak, persetujuan kebijakan, pemilik dan kontak resmi, VAPT independen, konfigurasi DNS/TLS/WAF/SIEM aktual, pengujian restore pada lingkungan terpisah, kontrak vendor, capacity/load test, pelatihan petugas, penilaian aksesibilitas, dan persetujuan go-live.
