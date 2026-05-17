# Use Case Diagram Komdigi HRIS

## Aktor

- `Super Admin`
- `Admin Direktorat`
- `Pegawai`

## Diagram

```mermaid
flowchart LR
    SA[Super Admin]
    AD[Admin Direktorat]
    PG[Pegawai]

    UC1((Login))
    UC2((Lihat Dashboard))
    UC3((Kelola Pegawai))
    UC4((Lihat Detail Pegawai))
    UC5((Kelola Profil Sendiri))
    UC6((Enroll Wajah))
    UC7((Absen Masuk))
    UC8((Absen Pulang))
    UC9((Lihat Riwayat Absensi))
    UC10((Filter dan Export Absensi))
    UC11((Lihat Notifikasi))
    UC12((Lihat Activity Log))
    UC13((Kelola Proyek))
    UC14((Lihat Peta Lokasi))
    UC15((Kelola Struktur Organisasi))

    SA --> UC1
    SA --> UC2
    SA --> UC3
    SA --> UC4
    SA --> UC9
    SA --> UC10
    SA --> UC11
    SA --> UC12
    SA --> UC13
    SA --> UC14
    SA --> UC15

    AD --> UC1
    AD --> UC2
    AD --> UC3
    AD --> UC4
    AD --> UC9
    AD --> UC10
    AD --> UC11
    AD --> UC12
    AD --> UC13
    AD --> UC14

    PG --> UC1
    PG --> UC2
    PG --> UC5
    PG --> UC6
    PG --> UC7
    PG --> UC8
    PG --> UC9
    PG --> UC11
```

## Penjelasan Use Case

### Super Admin

Super Admin merupakan aktor dengan akses tertinggi. Ia dapat melihat seluruh data lintas direktorat, mengelola pegawai, memantau absensi, mengakses activity log, dan memantau notifikasi sistem.

### Admin Direktorat

Admin Direktorat hanya dapat bekerja dalam scope direktoratnya sendiri. Ia dapat mengelola pegawai pada direktorat tersebut, memantau absensi, dan melihat notifikasi serta activity log yang relevan.

### Pegawai

Pegawai berfokus pada data pribadi. Ia dapat login, melihat dashboard pribadi, memperbarui profil, melakukan enroll wajah, absen masuk, absen pulang, dan melihat riwayat absensinya sendiri.
