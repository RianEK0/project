# Object Storage Privat untuk Dokumen SIPADI

Production memakai `FILE_STORAGE_DRIVER=s3`. Berkas dipindai ClamAV, dienkripsi AES-256-GCM oleh SIPADI, lalu diunggah dengan SSE-KMS. Database hanya menyimpan referensi `s3:`; bucket tidak pernah dipublikasikan dan aplikasi tidak membuat presigned URL sehingga seluruh download tetap melewati RBAC, DLP, dan audit SIPADI.

Saat startup, API memeriksa bahwa bucket mempunyai:

- versioning berstatus `Enabled`;
- seluruh Public Access Block aktif; dan
- default server-side encryption `aws:kms`.

Startup production gagal bila pemeriksaan tersebut gagal. Workload API memerlukan izin minimum pada prefix `FILE_S3_PREFIX`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::NAMA_BUCKET/sipadi/files/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetBucketVersioning", "s3:GetBucketPublicAccessBlock", "s3:GetEncryptionConfiguration"],
      "Resource": "arn:aws:s3:::NAMA_BUCKET"
    },
    {
      "Effect": "Allow",
      "Action": ["kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey"],
      "Resource": "ARN_KUNCI_KMS"
    }
  ]
}
```

Jangan memberi `s3:DeleteBucket`, perubahan bucket policy, perubahan Public Access Block, atau administrasi KMS kepada workload aplikasi. Aktifkan access logging/data events, alarm perubahan policy, replikasi sesuai klasifikasi data dan lokasi penyimpanan yang disahkan, serta lifecycle hanya setelah JRA/legal hold mengizinkan.

## Migrasi file lama

Jalankan pada maintenance window setelah backup dan verifikasi bucket:

```bash
npm run files:migrate-s3 --workspace @sipadi/api
npm run files:migrate-s3 --workspace @sipadi/api -- --apply
```

Mode awal hanya dry-run. Mode `--apply` mengenkripsi file lokal bila perlu, mengunggah object, memperbarui seluruh referensi database dalam transaksi, lalu menghapus salinan lokal. Nilai `MISSING` membuat proses gagal dan harus diselesaikan sebelum go-live.
