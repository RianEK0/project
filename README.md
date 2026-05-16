# Sistem Manajemen Data Inspektorat Kota Depok

Aplikasi web interaktif React + Tailwind CSS untuk simulasi dashboard Inspektorat Kota Depok.

## Menjalankan Aplikasi

```bash
npm install
npm run dev
```

Build produksi:

```bash
npm run build
```

Akun login dummy:
- admin / admin123
- inspektur / inspektur123
- auditor / auditor123

## Isi Data

- `data/dummy-data.json`: sumber data utama aplikasi.
- `data/*.csv`: versi tabel untuk beberapa modul.
- `dummy_files/`: file dummy PDF, CSV, dan TXT untuk simulasi arsip, upload, download, dan preview.

## Fitur

- Dashboard statistik, agenda, notifikasi, dan grafik Recharts yang clickable.
- Sidebar: Dashboard, Data Organisasi, Pengawasan, Dokumen & Laporan, Pengaturan.
- Halaman tabel dengan search, filter status, filter tahun, dan pagination dummy.
- Modal detail, tambah, edit, konfirmasi hapus, approve, preview, dan download.
- Role based access dummy untuk Admin, Inspektur, dan Auditor.
- Arsip Dokumen membaca file dari `dummy_files/`.

Catatan:
Semua nama, dokumen, nomor surat, tanggal, dan data bersifat dummy/simulasi.
