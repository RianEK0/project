# Threat Model SIPADI

Versi threat model harus diperbarui pada perubahan identitas, penyimpanan, integrasi, role, boundary jaringan, atau jenis data. Review minimal setiap semester dan sebelum rilis mayor.

## Aset kritis

1. Isi arsip dan metadata, termasuk data pribadi dan dokumen hasil pengawasan.
2. Kredensial pengguna, passkey public key/counter, secret TOTP, recovery code, sesi, dan akun istimewa.
3. Keputusan disposisi, status verifikasi, riwayat peminjaman/pemusnahan, dan audit trail.
4. Key enkripsi, signing key audit, backup, source, pipeline rilis, dan konfigurasi infrastruktur.
5. Ketersediaan layanan serta kepercayaan publik pada informasi resmi.

## Aktor dan trust boundary

- Publik anonim; pengguna sah; pengguna internal jahat/terkompromi; administrator aplikasi; DBA/infrastruktur; vendor; penyerang internet; malware/ransomware; pipeline CI/CD.
- Boundary utama: browser–edge, edge–web/API, API–database/storage/scanner, host–SIEM, CI–registry/production, serta personel–proses persetujuan.

## Skenario prioritas dan kontrol

| ID | Skenario | Dampak | Kontrol utama | Risiko residual/tindakan |
|---|---|---|---|---|
| T01 | Credential stuffing/phishing admin | Pengambilalihan | Rate limit, event/strike, passkey wajib, revokasi sesi | Uji alert dan helpdesk anti-social-engineering |
| T02 | Bypass otorisasi/BOLA | Kebocoran lintas unit | RBAC dan scope server-side, regression test | VAPT seluruh endpoint dan negative test per role |
| T03 | Upload malware/polyglot | Kompromi endpoint/operator | Magic bytes, allowlist, ClamAV fail-closed, storage privat | Sandbox/CDR bila dokumen berisiko tinggi |
| T04 | SQLi/XSS/command injection | Data/host compromise | Parameterized query, Zod, CSP/Helmet, detector/WAF | DAST/SAST dan review sink baru |
| T05 | Pencurian JWT/XSS | Sesi dibajak | Session storage, CSP, expiry, token version, AMR | Evaluasi BFF/HttpOnly cookie untuk target risiko tinggi |
| T06 | DBA/operator mengubah audit | Hilang akuntabilitas | Hash chain, append-only trigger, WORM, SIEM | Dual control DBA dan rekonsiliasi log independen |
| T07 | Ransomware/hapus massal | Layanan/data hilang | Least privilege, immutable offsite backup, restore drill | Pisahkan kredensial backup dan production |
| T08 | DDoS/resource exhaustion | Layanan tidak tersedia | CDN/DDoS, WAF, rate/body limit, cardinality guard | Load test dan runbook scrubbing/upstream escalation |
| T09 | Dependency/CI compromise | Backdoor rilis | Lockfile, audit/CodeQL/dependency review, SBOM, attestation, SHA-pinned action | Promosi by digest dan isolated runner review |
| T10 | Salah konfigurasi cloud/storage | Paparan arsip | IaC review, private network/bucket, policy test | CSPM/config review independen sebelum go-live |
| T11 | Abuse fitur ekspor/pencarian | Eksfiltrasi bertahap | RBAC, audit, counter atomik, threshold alert, hold persisten, pelepasan pejabat kedua | Tuning baseline per unit dan korelasi SIEM/UEBA |
| T12 | Reset MFA oleh helpdesk palsu | Account takeover | Role admin, current password, passkey, dual approval sekali pakai, audit, revocation | Prosedur verifikasi identitas tetap wajib diuji |
| T13 | Manipulasi backup/restore | Data palsu/rollback | AES-GCM, checksum, ukuran/format, audit dipreservasi | Restore hanya change window + rekonsiliasi |
| T14 | Kebocoran secret di repo/log | Kompromi menyeluruh | Env/secret manager, redaction, secret scanning | Rotasi segera dan audit penggunaan key |
| T15 | Supply-chain browser/passkey downgrade | MFA dilemahkan | HTTPS, exact origins/RP ID, UV required, role gate | Uji perangkat/browser yang disetujui dan recovery process |

## Abuse case wajib untuk VAPT

- Mengganti `unit_id`, `user_id`, `archive_id`, atau status melalui request manual.
- Mengakses download/preview dengan token role/unit lain dan token yang telah dicabut.
- Mengulang challenge TOTP/WebAuthn, response assertion, recovery code, dan ceremony token.
- Menghapus passkey terakhir role wajib atau memakai origin/RP ID palsu.
- Mengunggah file extension/MIME/magic-byte berbeda, decompression bomb, dan EICAR pada lingkungan uji.
- Menyuntik formula spreadsheet, HTML/CSV, log forging, path traversal, serta oversized body.
- Memutus hash chain, insert unsigned, update/delete/truncate audit, dan restore yang mencoba menimpa bukti.
- Membanjiri URL unik, login, search, export, SSE/notifikasi, serta koneksi lambat.
- Menjalankan download/preview/export paralel untuk mencoba melewati ambang eksfiltrasi, self-release hold, dan reuse tiket approval setelah payload berubah/eksekusi/kedaluwarsa.

## Penerimaan risiko

Temuan Critical/High terbuka menghentikan go-live. Medium memerlukan rencana, pemilik, tenggat, kompensating control, dan persetujuan tertulis pemilik risiko/security lead. Low dicatat dan diprioritaskan. Tidak ada risiko yang dianggap diterima hanya karena kontrol tercantum dalam dokumen.
