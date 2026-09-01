# Tata Kelola Data, Privasi, dan Kearsipan

## Register pemrosesan wajib

Sebelum data nyata masuk, pemilik data harus mendokumentasikan kategori data, tujuan dan dasar pemrosesan, sumber, subjek data, penerima, lokasi penyimpanan, transfer pihak ketiga/luar yurisdiksi, retensi/JRA, penghapusan, kontrol akses, serta kontak penanggung jawab. Lakukan kajian dampak pelindungan data untuk pemrosesan berisiko tinggi sesuai penilaian unit hukum/PPDP.

## Klasifikasi minimum

| Kelas | Contoh | Perlakuan minimum |
|---|---|---|
| Publik | Informasi layanan dan kebijakan yang disahkan | Boleh dipublikasi oleh pejabat berwenang; integritas dan versi dijaga |
| Internal | SOP kerja umum, metadata non-sensitif | Akun internal, least privilege, dilarang berbagi ke kanal publik |
| Terbatas | Data pribadi, draf pemeriksaan, disposisi | Need-to-know, MFA, enkripsi, ekspor terkontrol, audit akses |
| Rahasia | Bukti/hasil pengawasan sensitif, kredensial, key | Akses khusus, passkey, larangan download default, dual control, retensi dan media khusus |

Label aplikasi harus dipetakan dan disahkan terhadap klasifikasi keamanan dan akses arsip resmi instansi; tabel di atas adalah baseline teknis, bukan pengganti ketentuan kearsipan.

## Prinsip pengelolaan

- Kumpulkan data yang diperlukan untuk tujuan sah dan terdokumentasi; jangan memakai data production untuk development/test.
- Pisahkan tenant/unit dan tugas. Review entitlement per kuartal serta segera pada mutasi, cuti panjang, atau terminasi.
- Terapkan retensi berdasarkan JRA/legal hold. Penghapusan karena permintaan subjek data tidak boleh mengalahkan kewajiban arsip/legal hold tanpa keputusan pejabat berwenang.
- Catat ekspor, download, perubahan, verifikasi, pemusnahan, peminjaman, akses istimewa, dan keputusan permintaan privasi.
- Media cadangan mengikuti klasifikasi tertinggi data di dalamnya. Kunci dan backup dipisahkan serta dimusnahkan secara terverifikasi pada akhir retensi.
- Vendor hanya menerima data minimum, melalui perjanjian, penilaian risiko, subprocessor register, lokasi data yang disetujui, kewajiban insiden, return/deletion, dan hak audit.

## Prosedur permintaan dan insiden privasi

1. Verifikasi identitas pemohon tanpa mengumpulkan bukti berlebihan.
2. Catat nomor perkara, ruang lingkup, dasar, sistem terkait, legal hold, keputusan, penyetuju, tenggat yang berlaku, dan bukti penyelesaian.
3. Ekspor harus direview dan disanitasi agar tidak membuka hak/data pihak lain atau informasi yang dikecualikan.
4. Bila diduga terjadi pelanggaran data pribadi, aktifkan SOP insiden, lindungi bukti, nilai jenis/volume/subjek/dampak, konsultasikan PPDP dan unit hukum, lalu penuhi notifikasi yang berlaku menggunakan informasi terverifikasi.

## Kolom register pemrosesan

Gunakan template `processing-register.csv`. Setiap baris wajib memiliki pemilik bisnis dan pemilik teknis. Nilai kosong pada tujuan, dasar, klasifikasi, retensi, atau penerima adalah blocker go-live untuk dataset tersebut.
