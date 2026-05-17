# Matriks Hak Akses Komdigi HRIS

## Tabel Hak Akses

| Fitur | Super Admin | Admin Direktorat | Pegawai |
|---|---|---|---|
| Login | Ya | Ya | Ya |
| Lihat dashboard | Semua data | Data direktorat | Data pribadi |
| Lihat daftar pegawai | Semua pegawai | Pegawai direktorat | Hanya diri sendiri |
| Tambah pegawai | Ya | Ya, hanya direktorat sendiri | Tidak |
| Edit pegawai | Ya | Ya, hanya direktorat sendiri | Tidak |
| Hapus pegawai | Ya | Ya, hanya direktorat sendiri | Tidak |
| Lihat detail pegawai | Ya | Ya, hanya direktorat sendiri | Hanya diri sendiri |
| Ubah profil sendiri | Ya | Ya | Ya |
| Enroll wajah | Ya | Ya | Ya |
| Absen masuk | Ya | Ya | Ya |
| Absen pulang | Ya | Ya | Ya |
| Lihat riwayat absensi | Semua data | Data direktorat | Data pribadi |
| Filter absensi | Ya | Ya | Terbatas pada data pribadi |
| Export absensi | Ya | Ya | Ya, untuk datanya sendiri |
| Lihat notifikasi | Ya | Ya | Ya |
| Tandai notifikasi dibaca | Ya | Ya | Ya |
| Lihat activity log | Ya | Ya, dalam scope direktorat | Hanya aktivitas sendiri |
| Kelola proyek | Ya | Ya | Tidak |
| Lihat peta lokasi | Ya | Ya | Tidak |
| Kelola struktur organisasi | Ya | Tidak | Tidak |

## Catatan Akses

- `Admin Direktorat` dibatasi oleh `direktoratId` miliknya.
- `Pegawai` hanya dapat mengakses record dirinya sendiri pada fitur yang bersifat personal.
- Hak akses di backend ditegakkan dengan middleware JWT dan verifikasi role.
