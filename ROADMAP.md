# Roadmap SIPADI

Dokumen ini merangkum backlog pengembangan SIPADI setelah fitur inti pengarsipan, disposisi, peminjaman, penyusutan, dan pemusnahan berjalan.

## Prioritas Paling Terasa

Urutan ini dipilih berdasarkan dampak langsung ke pengguna setelah fitur pengembalian peminjaman ditambahkan.

1. Reminder jatuh tempo peminjaman
2. Perpanjangan peminjaman
3. Riwayat peminjaman per arsip
4. Inbox notifikasi penuh
5. Pengaturan akun

## Roadmap Bertahap

### Gelombang 1

- Reminder jatuh tempo
- Perpanjangan peminjaman
- Riwayat peminjaman per arsip
- Inbox notifikasi penuh

### Gelombang 2

- Dashboard tugas hari ini
- Dashboard tugas per role
- SLA monitoring
- Lokasi fisik arsip

### Gelombang 3

- Pengaturan akun
- Reset password oleh admin
- Soft delete dan restore arsip
- Audit export

### Gelombang 4

- Import arsip massal CSV/Excel
- QR code atau barcode arsip
- Template surat dan berita acara otomatis
- Riwayat versi dokumen
- Pencarian lanjutan
- Pencarian full-text dan OCR dokumen
- Batch download dan batch export laporan

### Gelombang 5

- Test suite dan CI
- Scheduled job untuk notifikasi otomatis
- Backup dan restore
- API docs
- Watermark dokumen sensitif
- Checksum file
- Log akses arsip
- Riwayat login user

### Gelombang 6

- Favorit arsip dan bookmark halaman detail
- Arsip terkait
- Tag atau label internal
- Kalender deadline
- Pusat aktivitas saya
- Antrian persetujuan

### Gelombang 7

- Bulk action arsip
- Draft otomatis pada form panjang
- Progress upload file
- Validasi kualitas file
- Template metadata per jenis arsip
- Nomor otomatis per jenis dokumen

## Backlog Fitur

### Penelusuran Dan Produktivitas Arsip

- Favorit arsip
  User dapat menandai dokumen yang sering dipakai agar lebih cepat dibuka kembali.

- Bookmark halaman detail
  Arsip atau disposisi penting dapat disimpan sebagai bookmark personal untuk akses cepat.

- Arsip terkait
  Hubungkan satu arsip dengan arsip lain yang masih satu kasus, surat, audit, atau pemeriksaan.

- Tag atau label internal
  Tandai arsip berdasarkan tema, kasus, audit, unit kerja, atau kebutuhan internal lain.

- Pencarian lanjutan
  Tambahkan kombinasi filter seperti rentang tanggal, retensi, pembuat, tingkat keamanan, dan status siklus hidup.

- Simpan filter pencarian
  Query yang sering dipakai dapat disimpan agar tidak perlu menyusun filter berulang.

- Pencarian full-text
  Pencarian tidak berhenti pada judul dan nomor dokumen, tetapi juga isi dokumen yang sudah diproses.

- OCR dokumen
  PDF hasil scan dapat dikenali isinya sehingga ikut mendukung pencarian full-text.

- Thumbnail preview
  Daftar arsip menampilkan thumbnail untuk PDF atau gambar agar dokumen lebih cepat dikenali.

### Peminjaman Dan Akses Arsip

- Perpanjangan peminjaman
  Peminjam dapat mengajukan perpanjangan deadline tanpa membuat permohonan baru, lalu admin menyetujui atau menolak.

- Reminder jatuh tempo
  Notifikasi otomatis untuk peminjaman H-3, H-1, dan yang sudah lewat deadline.

- Riwayat peminjaman per arsip
  Tampilkan siapa yang meminjam, kapan, status akhir, dan catatan pengembaliannya pada detail arsip.

- Masa berlaku akses pinjam
  Hak akses karena peminjaman dibuat lebih eksplisit dan otomatis berakhir saat deadline selesai atau saat arsip dikembalikan.

- Berita acara serah terima peminjaman
  Dokumen serah terima dapat dicetak saat peminjaman dimulai atau saat pengembalian dilakukan.

### Notifikasi Dan Tindak Lanjut

- Inbox notifikasi penuh
  Halaman notifikasi terpisah dengan filter `belum dibaca`, `peminjaman`, `retensi`, dan `disposisi`.

- Dashboard tugas hari ini
  Ringkasan tindakan prioritas seperti approval pending, disposisi jatuh tempo, peminjaman telat, dan retensi yang habis.

- Dashboard tugas per role
  Tampilan dashboard yang menyesuaikan peran seperti Admin, Inspektur, Sekretaris, Umpeg, dan unit pelaksana.

- SLA monitoring
  Penandaan item yang melampaui target waktu proses, misalnya disposisi lebih dari 3 hari belum diproses.

- Scheduled job
  Notifikasi retensi dan deadline berjalan otomatis harian tanpa menunggu user membuka aplikasi.

- Eskalasi otomatis
  Item yang melewati SLA seperti disposisi dan peminjaman dapat dinaikkan otomatis ke pihak yang relevan.

- Kalender deadline
  Semua jatuh tempo disposisi, peminjaman, dan retensi dapat dilihat dalam tampilan kalender.

- Antrian persetujuan
  Sediakan area khusus untuk item yang menunggu tindakan pimpinan atau pejabat berwenang.

- Pusat aktivitas saya
  Ringkasan personal berisi tugas, item pending, notifikasi, dan aktivitas yang perlu segera ditindaklanjuti.

- Ringkasan aktivitas per user
  Tampilkan statistik seperti jumlah arsip dibuat, disposisi dikirim, dan peminjaman aktif per pengguna.

### Akun Dan Administrasi Pengguna

- Pengaturan akun
  Ubah password, update profil, dan bila diperlukan menambahkan foto profil serta nama tampilan.

- Reset password oleh admin
  Admin dapat mereset password pengguna tanpa mengedit data user secara manual.

- Riwayat login user
  Catat waktu login, user, dan jejak akses dasar untuk membantu audit dan troubleshooting akun.

### Data Arsip Dan Operasional

- Import arsip massal CSV/Excel
  Upload data arsip dalam jumlah besar untuk mengurangi input satu per satu.

- Bulk action arsip
  Lakukan verifikasi, ubah kategori, atau pindah status untuk banyak arsip sekaligus.

- Soft delete dan restore
  Arsip yang dihapus masuk ke recycle bin terlebih dahulu dan masih dapat dipulihkan.

- Lokasi fisik arsip
  Tambahkan metadata rak, box, map, ruangan, dan nomor berkas untuk mendukung penelusuran fisik.

- QR code atau barcode arsip
  Memudahkan pelacakan cepat saat pengecekan fisik atau serah terima dokumen.

- Riwayat versi dokumen
  Setiap pembaruan file arsip tetap menyimpan versi sebelumnya untuk kebutuhan audit dan pembanding.

- Deteksi duplikasi dokumen
  Sistem membantu mengenali dokumen yang kemungkinan ganda berdasarkan nomor surat, judul, atau metadata yang mirip.

- Checklist kelengkapan arsip
  User dapat melihat metadata atau lampiran apa saja yang masih kurang sebelum arsip dianggap lengkap.

- Status arsip dibekukan atau legal hold
  Arsip tertentu dapat dikunci agar tidak disusutkan atau dimusnahkan saat masih dibutuhkan untuk perkara tertentu.

- Cetak label arsip
  Label fisik box, map, atau rak dapat digenerate langsung dari metadata arsip.

- Arsip terkait
  Relasi antararsip mendukung penelusuran konteks pemeriksaan atau kasus.

- Template retensi per jenis dokumen
  Saat input arsip, retensi bisa otomatis terisi berdasarkan jenis dokumen atau aturan klasifikasi.

- Template metadata per jenis arsip
  Form input menyesuaikan tipe arsip sehingga pengisian lebih cepat dan konsisten.

- Nomor otomatis per jenis dokumen
  Sistem dapat membantu menghasilkan nomor dokumen sesuai pola tertentu agar input lebih seragam.

- Laporan kualitas data
  Deteksi arsip yang belum punya klasifikasi, retensi, file, atau metadata penting lain.

- Template surat dan berita acara otomatis
  Surat pengantar, tanda terima, berita acara, dan dokumen pendukung lain dapat digenerate dari data sistem.

- Audit export
  Audit log dapat diunduh untuk kebutuhan pemeriksaan dan arsip eksternal.

- Batch download
  Beberapa arsip dapat diunduh sekaligus, misalnya dalam ZIP.

- Batch export laporan
  Laporan berdasarkan filter tertentu bisa diekspor sekaligus tanpa mengunduh satu per satu.

### Kualitas Platform Dan Pengembangan

- Draft otomatis
  Form panjang seperti input arsip atau disposisi menyimpan draft lokal agar data tidak hilang.

- Progress upload file
  User melihat status unggah file besar secara real-time.

- Validasi kualitas file
  Sistem memeriksa ukuran, format rusak, halaman kosong, atau file yang gagal diproses.

- Watermark preview dan download
  Dokumen sensitif dapat diberi watermark agar jejak pemakaian lebih jelas.

- Checksum file
  Integritas file arsip dapat diverifikasi untuk mendeteksi korupsi atau perubahan tak diinginkan.

- Log akses arsip
  Catat siapa membuka, mengunduh, meminjam, atau mengakses dokumen tertentu.

- Test dan CI
  Tambahkan pengujian untuk alur penting dan jalankan otomatis di pipeline agar perubahan baru lebih aman.

- Backup dan restore
  Siapkan prosedur pemulihan untuk database dan file arsip saat sistem dipakai dengan data nyata.

- API docs
  Dokumentasi endpoint internal seperti Swagger atau bentuk lain agar backend lebih mudah dirawat dan diintegrasikan.

### Kolaborasi Dan Disposisi

- Delegasi disposisi
  Penerima dapat meneruskan tugas ke user lain dengan riwayat delegasi yang tetap tercatat.

- Tanda baca disposisi
  Bedakan status sudah dibaca dan belum dibaca dengan indikator yang lebih jelas.

- Lampiran komentar
  Diskusi pada arsip dapat menyertakan file pendukung.

- Komentar dengan mention user
  User tertentu dapat disebut langsung di komentar dan menerima notifikasi terkait.

- Mention user di komentar
  Fungsinya sama dengan mention pada komentar arsip, tetapi bisa diperluas ke konteks disposisi dan diskusi lain.

### Keamanan, Persetujuan, Dan Kepatuhan

- Tanda tangan digital persetujuan
  Proses review, peminjaman, penyusutan, dan pemusnahan dapat memakai persetujuan digital yang tercatat.

## Catatan Prioritas

- Jika targetnya manfaat yang paling cepat terasa untuk pengguna, fokuskan pada reminder jatuh tempo, perpanjangan peminjaman, riwayat peminjaman, dan inbox notifikasi.
- Jika targetnya kesiapan operasional jangka panjang, percepat test dan CI, scheduled job, backup dan restore, serta API docs.
- Jika targetnya pengelolaan arsip fisik, prioritaskan lokasi fisik arsip dan QR code atau barcode.
- Jika targetnya kualitas data dan pencarian, prioritaskan OCR, full-text search, checklist kelengkapan, duplikasi dokumen, dan laporan kualitas data.
- Jika targetnya kolaborasi harian, prioritaskan pusat aktivitas saya, kalender deadline, delegasi disposisi, komentar dengan mention, dan lampiran komentar.
