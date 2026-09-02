# Keamanan Rantai Pasok dan Rilis SIPADI

Rilis produksi hanya boleh berasal dari tag Git yang lolos workflow `Attested Security Release` dan `Signed Container Release`. Workflow membuat arsip sumber, CycloneDX SBOM, checksum SHA-256, provenance, image SBOM, pemindaian High/Critical, dan tanda tangan keyless Sigstore untuk digest image API serta web.

## Kontrol repositori yang wajib diaktifkan

1. Lindungi branch produksi: minimal dua reviewer, CODEOWNERS organisasi, percakapan selesai, status `CI` dan `SIPADI Security` wajib lulus, serta larangan force-push.
2. Batasi pembuatan tag `v*` pada release manager dan security approver yang berbeda.
3. Wajibkan MFA/passkey pada organisasi GitHub dan gunakan akun layanan terpisah untuk deployment.
4. Izinkan hanya GitHub-owned actions dan action yang dipin ke full commit SHA.
5. Aktifkan secret scanning, push protection, Dependabot alerts, private vulnerability reporting, dan retensi audit log organisasi.
6. Gunakan GitHub Environment `production` dengan reviewer, deployment branch/tag policy, dan kredensial OIDC berumur pendek. Jangan simpan cloud access key statis sebagai repository secret.

## Verifikasi sebelum deployment

```bash
sha256sum -c SHA256SUMS
gh attestation verify sipadi-source.tar.gz -R ORGANISASI/REPOSITORI
gh attestation verify sipadi-source.tar.gz -R ORGANISASI/REPOSITORI \
  --predicate-type https://cyclonedx.org/bom

GITHUB_REPOSITORY=ORGANISASI/REPOSITORI \
API_IMAGE=ghcr.io/organisasi/repo/api@sha256:DIGEST \
WEB_IMAGE=ghcr.io/organisasi/repo/web@sha256:DIGEST \
sh deploy/supply-chain/verify-release-images.sh
```

Deployment wajib mengambil nilai `API_IMAGE` dan `WEB_IMAGE` dari artifact `sipadi-container-release-*`, bukan mengetik ulang tag. Jalankan production dengan `deploy/docker-compose.signed-release.override.yml.example` agar Compose menarik digest immutable dan mengabaikan build lokal. Jika verifikasi Cosign gagal, hentikan rilis; jangan memakai `--insecure-ignore-tlog`, melewati pemeriksaan identitas workflow, atau membangun ulang image pada host production.

Catat commit, tag, checksum, identitas dua penyetuju, hasil CI, hasil VAPT, nomor perubahan, waktu deployment, dan rencana rollback pada berita acara rilis. Artifact workflow bukan arsip permanen; salin evidence bundle ke penyimpanan WORM/immutable milik instansi sesuai retensi yang disahkan.

## Pemisahan tugas

- Pengembang mengusulkan perubahan dan tidak menyetujui perubahan miliknya sendiri.
- Security reviewer menilai threat model, SAST/SCA, secrets, dan risiko residual.
- Release manager memverifikasi attestation/checksum dan mengeksekusi promosi artefak yang sama.
- Pemilik layanan memberi persetujuan go-live; administrator infrastruktur tidak boleh mengubah source artefak.
