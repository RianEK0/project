# Matriks Kontrol SMKI dan SPBE

Matriks ini menghubungkan kontrol operasional dengan bukti SIPADI. Nomor kontrol standar formal harus dipetakan oleh fungsi SMKI sesuai versi standar dan ruang lingkup sertifikasi yang benar.

| Domain | Kontrol SIPADI | Evidence di repositori/operasi | Pemilik | Status |
|---|---|---|---|---|
| Tata kelola | Scope, RACI, risk register, persetujuan perubahan | Paket dokumen ini, tiket perubahan | Pemilik layanan | Perlu diisi |
| Aset | Inventaris aplikasi, host, data, vendor, owner | `asset-register.csv`, CMDB | Asset owner | Perlu diisi |
| Risiko | Threat model, treatment dan acceptance formal | `THREAT_MODEL.md`, `risk-register.csv` | Security lead | Baseline tersedia |
| Identitas | Akun individual, RBAC, MFA/passkey, revokasi | Kode auth, user/access review export | IAM owner | Teknis tersedia |
| Kriptografi | TLS, AES-GCM backup/secret/berkas, HMAC audit, key ID dan rotasi | Env policy, migration report, KMS logs, test | Key custodian | Teknis tersedia; KMS eksternal |
| Operasi | Patch, anti-malware, log, monitoring, backup | Workflows, ClamAV, Wazuh, runbook | Operations | Template tersedia |
| Jaringan | WAF/DDoS, segmentasi, firewall, internal metrics | Compose/ruleset/firewall export | Infrastruktur | Harus diaktifkan |
| Pengembangan | Review, test, SCA/SAST/DAST, secrets | CI/Security workflow, VAPT | Engineering | Baseline tersedia |
| Rantai pasok | Lockfile, SBOM, provenance, vendor review | Release evidence, vendor register | Release manager | Workflow tersedia |
| Insiden | Deteksi, triase, eskalasi, bukti, postmortem | Security events, Wazuh, SOP | CSIRT/SOC | Drill diperlukan |
| Pemisahan tugas | Dual approval sekali pakai untuk operasi kritis; pemohon dan penyetuju berbeda | Approval queue, audit chain, uji negatif | Pemilik layanan | Teknis tersedia |
| Pencegahan kehilangan data | Counter atomik, alert anomali, hold download/ekspor, pelepasan dengan passkey pejabat lain | Pusat Keamanan, data egress events/holds, SIEM | SOC/pemilik data | Teknis tersedia; tuning diperlukan |
| Kontinuitas | Backup immutable, restore, RTO/RPO | Backup jobs, restore report, BIA | Service owner | Drill/BIA diperlukan |
| Privasi/arsip | Register, klasifikasi, JRA, legal hold | Data governance, processing register | Pemilik data | Harus diisi |
| Kepatuhan | Kajian hukum, audit, exception register | Legal memo, audit report | Unit hukum/APIP | Eksternal |

## Siklus pengendalian

- Bulanan: patch/dependency, kerentanan, backup, alert, akun istimewa, kapasitas, sertifikat/secret expiry.
- Triwulanan: access recertification, vendor risk, restore sample, rule tuning, risk treatment, tabletop incident.
- Semester: threat model, penilaian konfigurasi, VAPT berbasis risiko, klasifikasi dan retensi.
- Tahunan: BIA/BCP/DR penuh, kebijakan, pelatihan, audit internal, kaji ulang legal dan kontrak.

Setiap kontrol memiliki owner, frekuensi, evidence location, hasil terakhir, temuan, rencana koreksi, dan approver. Screenshot tanpa sumber/waktu tidak cukup sebagai satu-satunya bukti.
