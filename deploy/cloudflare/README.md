# Baseline Cloudflare untuk SIPADI

`ruleset-plan.json` berisi baseline yang harus direplikasi pada zone Cloudflare: WAF managed rules, rate limit login/MFA/upload, TLS strict, dan Authenticated Origin Pulls. Aktivasi tidak dilakukan dari repo karena membutuhkan zone ID, paket Cloudflare, dan kredensial pemilik domain.

Urutan penerapan:

1. Proxy-kan hanya hostname SIPADI (orange cloud), aktifkan `Full (strict)`, Always Use HTTPS, minimum TLS 1.2, dan Authenticated Origin Pulls.
2. Aktifkan Cloudflare Managed Ruleset dan OWASP Core Ruleset dalam mode log selama 24–48 jam. Tinjau false positive, lalu ubah ke block.
3. Buat custom rules dan rate limits sesuai `ruleset-plan.json`. Uji login, MFA, upload, download, SSE notifikasi, dan restore backup.
4. Batasi firewall origin ke daftar IP Cloudflare untuk 80/443 dan CIDR admin untuk SSH. Jangan lakukan ini sebelum hostname telah diproksikan dan akses console darurat tersedia.
5. Buat Logpush ke penyimpanan/SIEM bila paket mendukung, serta alert lonjakan 403/429 dan perubahan konfigurasi zone.

Nilai rate limit adalah baseline awal, bukan angka universal. Sesuaikan dari trafik sah dan jangan mengecualikan endpoint login dari WAF.
