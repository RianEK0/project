# Baseline Zero Trust dan Pemisahan Akses

Gunakan identity-aware proxy (IAP/Zero Trust Access) di depan SIPADI selain autentikasi aplikasi. IAP bukan pengganti RBAC, passkey, atau audit aplikasi.

## Jalur publik tanpa login IAP

- `/`, `/privacy`, `/terms`, `/security-information`, `/.well-known/security.txt`, dan aset statis yang diperlukan.
- `/api/health` hanya untuk probe minimal. Terapkan rate limit dan jangan mengembalikan versi, dependency, hostname, atau status database.
- `/login` dan endpoint ceremony auth yang diperlukan hanya bila pegawai memang login dari internet; batasi negara/jaringan sesuai kebijakan instansi.

## Jalur pegawai

Seluruh halaman arsip/disposisi/laporan dan `/api/*` lainnya membutuhkan identitas instansi di IAP. Terapkan conditional access: akun aktif, MFA IdP, perangkat terkelola, posture/EDR sehat, dan session lifetime yang disahkan. Passkey aplikasi tetap wajib bagi role istimewa.

## Jalur istimewa

Tambahkan policy lebih ketat untuk `/users`, `/security`, `/audit-logs`, `/system-tools` dan API pasangannya: grup khusus, perangkat terkelola, lokasi/jaringan yang disetujui, autentikasi ulang, serta logging ke SIEM. Akun vendor bersifat time-bound dan memerlukan sponsor.

## Jalur mesin/internal

- `/api/internal/metrics` dan `/api/internal/ready` tidak boleh dirutekan dari internet. Izinkan hanya subnet monitoring/service identity, lalu pertahankan `X-Metrics-Token` dari secret manager; gunakan mTLS bila platform mendukung.
- PostgreSQL, object storage privat, ClamAV, Wazuh, dashboard, admin host, SSH, dan backup endpoint hanya berada pada jaringan privat/management.
- Deployment memakai OIDC/workload identity. Jangan menggunakan akun manusia atau cloud key statis.

## Uji penerimaan

1. Pengguna anonim hanya dapat membuka jalur publik.
2. Pengguna pegawai biasa menerima 403 pada halaman dan API istimewa, termasuk request manual.
3. Perangkat tidak terkelola ditolak walau password benar.
4. Endpoint internal dari internet terlihat tidak ada dan tidak membocorkan perbedaan respons.
5. Logout IdP dan aplikasi mencabut sesi; perubahan role/MFA memutus token lama.
6. Semua keputusan allow/deny terlihat di audit IAP dan terkorelasi dengan request ID/log SIPADI.

Ekspor konfigurasi policy, daftar grup, hasil enam pengujian, dan bukti pengiriman log menjadi lampiran go-live. Template Cloudflare di repo belum mengaktifkan Access secara otomatis karena tenant, IdP, grup, dan posture organisasi harus ditetapkan pemilik berwenang.
