# Integrasi Wazuh SIPADI

Konfigurasi ini meneruskan event anti-hack SIPADI dan audit ModSecurity ke Wazuh. Agent dipasang pada host aplikasi; Wazuh Manager/Dashboard sebaiknya berada pada host atau jaringan administrasi terpisah.

1. Deploy Wazuh Manager/Dashboard sesuai dokumentasi resmi, pasang agent pada host SIPADI, lalu enroll agent.
2. Tambahkan isi `agent-sipadi.conf` ke `/var/ossec/etc/ossec.conf`. Jika API berjalan di Docker, arahkan Docker ke logging driver `journald` atau sesuaikan sumber log dengan deployment Anda.
3. Salin `decoders/sipadi_decoders.xml` ke `/var/ossec/etc/decoders/` dan `rules/sipadi_rules.xml` ke `/var/ossec/etc/rules/` pada Manager.
4. Jalankan `/var/ossec/bin/wazuh-logtest`, masukkan satu baris `SECURITY_EVENT {...}`, lalu pastikan rule `100100` cocok sebelum restart Manager.
5. Buat notifikasi untuk level 10 ke atas dan batasi akses Dashboard melalui VPN/SSO + MFA.

Jangan mengekspos port Wazuh Manager/Dashboard ke internet umum. Sinkronkan waktu seluruh host dengan NTP agar korelasi insiden akurat.
