# Runbook backup dan disaster recovery SIPADI

## Target dan kepemilikan

Isi sebelum produksi: pemilik backup `[nama]`, akun break-glass `[lokasi vault]`, RPO `[jam]`, RTO `[jam]`, retensi harian/bulanan `[nilai]`, bucket/region `[nilai]`, dan lokasi kunci offline `[nilai]`.

Baseline yang disiapkan:

- Export manual/API dan snapshot offsite memakai AES-256-GCM; manipulasi atau kunci salah membuat restore gagal.
- Backup otomatis menyalin database dan file upload ke object storage S3-compatible.
- Object Lock Governance dapat diaktifkan dengan `BACKUP_S3_OBJECT_LOCK_DAYS`; bucket harus dibuat dengan Object Lock sebelum digunakan.
- IAM runner backup hanya diberi `PutObject`, `AbortMultipartUpload` bila diperlukan, dan akses prefix SIPADI. Jangan beri `DeleteObject`, administrasi bucket, atau akses ke aplikasi publik.
- Aktifkan versioning, server-side encryption/KMS, access logging, alarm kegagalan timer, dan lifecycle setelah retensi wajib berakhir.

## Operasi harian

1. Isi `/etc/sipadi/backup.env` dengan database, key, bucket, region, prefix, dan kredensial workload/IAM role; permission file `0600` milik user `sipadi`.
2. Aktifkan `sipadi-offsite-backup.timer`; periksa `systemctl list-timers` dan log `journalctl -u sipadi-offsite-backup.service`.
3. Alert bila tidak ada manifest baru selama 26 jam, ukuran menyimpang signifikan, upload gagal, atau Object Lock tidak terpasang.
4. Jangan menyimpan `BACKUP_ENCRYPTION_KEY` di bucket yang sama. Simpan minimal dua salinan escrow terenkripsi pada pihak/lokasi berbeda.

Contoh kebijakan IAM minimum harus dibatasi ke resource `arn:aws:s3:::NAMA_BUCKET/PREFIX/*`:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:PutObject"],
    "Resource": "arn:aws:s3:::NAMA_BUCKET/sipadi/*"
  }]
}
```

## Restore drill bulanan

1. Buat lingkungan terisolasi tanpa akses ke pengguna/layanan eksternal. Catat snapshot yang dipilih dan hash metadata S3.
2. Unduh `database.sipadi`, verifikasi SHA-256 dengan manifest, lalu restore melalui halaman Backup & Restore menggunakan key dengan `keyId` yang cocok.
3. File upload offsite dibungkus sebagai `encrypted-file`. Dekripsi satu per satu dengan `npm run backup:decrypt-file --workspace @sipadi/api -- --input <file.sipadi> --output <tujuan>`; tool menolak menimpa file yang sudah ada.
4. Validasi jumlah baris per tabel, sampling hash dokumen, relasi arsip, autentikasi/MFA, role/unit, audit log, dan malware scan.
5. Catat waktu aktual terhadap RTO/RPO, temuan, dan bukti kelulusan. Hapus aman lingkungan drill setelah persetujuan.

## Rotasi kunci

1. Buat key 32-byte baru, naikkan ID (`backup-v2`/`mfa-v2`), dan simpan key lama di vault.
2. Masukkan key lama sebagai `BACKUP_PREVIOUS_ENCRYPTION_KEYS=backup-v1=<base64>` atau `MFA_PREVIOUS_ENCRYPTION_KEYS=mfa-v1=<base64>`. Pisahkan beberapa pasangan dengan titik koma.
3. Deploy dan uji dekripsi backup lama serta login MFA sebelum mencabut key lama dari runtime.
4. Jangan menghapus key lama sampai seluruh backup terkait melewati masa retensi dan seluruh secret MFA telah dimigrasi/re-enroll.
