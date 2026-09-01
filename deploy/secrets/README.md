# Secret Manager dan KMS SIPADI

Runtime mendukung secret langsung (`NAMA_SECRET`) atau file hasil mount (`NAMA_SECRET_FILE`), tetapi menolak keduanya dipakai bersamaan. Untuk production, gunakan workload identity dan secret manager/CSI/Vault Agent yang menulis secret ke tmpfs berizin baca hanya untuk user container. Jangan commit, bake ke image, menaruh di build argument, atau mencetak nilai secret ke log.

Secret yang mendukung pola `_FILE`:

- `DATABASE_URL`, `JWT_SECRET`, `MFA_ENCRYPTION_KEY`, `MFA_PREVIOUS_ENCRYPTION_KEYS`, dan `RECOVERY_CODE_PEPPER`.
- `AUDIT_SIGNING_KEY`, `AUDIT_PREVIOUS_SIGNING_KEYS`, `METRICS_TOKEN`, `BACKUP_ENCRYPTION_KEY`, dan `BACKUP_PREVIOUS_ENCRYPTION_KEYS`.
- `FILE_ENCRYPTION_KEY`, `FILE_PREVIOUS_ENCRYPTION_KEYS`, dan `SECURITY_STATE_REDIS_URL`.

Contoh konfigurasi workload setelah secret manager memasang file:

```text
JWT_SECRET_FILE=/run/secrets/sipadi-jwt
FILE_ENCRYPTION_KEY_FILE=/run/secrets/sipadi-file-key
AUDIT_SIGNING_KEY_FILE=/run/secrets/sipadi-audit-key
SECURITY_STATE_REDIS_URL_FILE=/run/secrets/sipadi-security-state-url
```

## Kebijakan minimum

1. Gunakan kunci berbeda untuk MFA, file, backup, audit, recovery code, JWT, database, metrics, dan Valkey/Redis.
2. Kunci master berada pada KMS/HSM; aplikasi memperoleh secret melalui workload identity berumur pendek, bukan access key statis.
3. Batasi pembacaan secret menurut service account dan environment. Developer tidak memperoleh akses baca secret production.
4. Aktifkan audit KMS/secret manager dan alert untuk pembacaan massal, akses di luar jadwal, perubahan policy, disable/delete key, serta kegagalan dekripsi.
5. Rotasi memakai key ID baru dan `*_PREVIOUS_*` selama masa transisi. Uji dekripsi data lama sebelum key lama dinonaktifkan.
6. Escrow key backup dilakukan dual control pada vault terpisah. Jangan simpan key backup di bucket backup atau host aplikasi.

`npm run security:preflight` dapat membaca pola `_FILE` dan tidak menampilkan nilainya. Bukti go-live harus menyertakan identitas workload, policy akses, jadwal rotasi, log uji akses ditolak, dan prosedur break-glass.
