# Dokumentasi API Komdigi HRIS

Base URL default:

```text
http://localhost:5001/api
```

Autentikasi menggunakan header:

```text
Authorization: Bearer <token>
```

## 1. Auth

### `POST /auth/login`

Login user.

Body:

```json
{
  "email": "admin@komdigi.go.id",
  "password": "admin123"
}
```

### `GET /auth/me`

Mengambil profil user yang sedang login.

## 2. Organisasi

### `GET /org/roles`

Mengambil daftar role.

### `GET /org/direktorats`

Mengambil daftar direktorat dan divisinya.

### `GET /org/stats`

Mengambil statistik dashboard:

- total user
- total hadir hari ini
- total belum hadir
- tren kehadiran
- ringkasan per divisi
- absensi terbaru

## 3. User / Pegawai

### `GET /users`

Ambil daftar pegawai.

Query opsional:

- `search`
- `direktoratId`
- `divisiId`

### `GET /users/:id`

Ambil detail pegawai.

### `POST /users`

Buat pegawai baru.

Form data:

- `name`
- `email`
- `password`
- `position`
- `roleId`
- `direktoratId`
- `divisiId`
- `photo`

### `PUT /users/:id`

Update pegawai.

### `DELETE /users/:id`

Hapus pegawai.

### `PUT /users/me/profile`

Update profil user sendiri.

### `POST /users/me/enroll-face`

Simpan descriptor wajah user.

Body:

```json
{
  "faceDescriptor": [0.1, 0.2, 0.3]
}
```

## 4. Attendance

### `GET /attendance`

Ambil riwayat absensi.

Query opsional:

- `startDate`
- `endDate`
- `direktoratId`
- `divisiId`
- `status`
- `userId`

### `GET /attendance/summary`

Ringkasan absensi:

- total
- valid
- invalid

### `GET /attendance/reminder`

Cek apakah user belum absen hari ini.

### `GET /attendance/export`

Export absensi ke CSV.

### `POST /attendance/check-in`

Simpan absen masuk.

Body:

```json
{
  "photoIn": "data:image/jpeg;base64,...",
  "isValid": true,
  "note": "Wajah valid",
  "lat": -6.2,
  "lng": 106.8
}
```

### `POST /attendance/check-out`

Simpan absen pulang.

Body:

```json
{
  "photoOut": "data:image/jpeg;base64,...",
  "note": "Checkout valid",
  "lat": -6.2,
  "lng": 106.8
}
```

## 5. Notifications

### `GET /notifications`

Ambil daftar notifikasi sesuai role/scope user.

### `PUT /notifications/:id/read`

Tandai notifikasi sebagai dibaca.

## 6. Activity Log

### `GET /activity`

Ambil activity log sesuai scope akses user.

## 7. Projects

### `GET /projects`

Ambil daftar proyek.

### `POST /projects`

Buat proyek baru.

### `DELETE /projects/:id`

Hapus proyek.

## 8. Location

### `GET /location`

Ambil posisi user aktif.

### `POST /location/update`

Update koordinat user aktif.

## Catatan Respons

- Respons sukses menggunakan format JSON.
- Error utama yang mungkin muncul:
  - `400` validasi gagal
  - `401` unauthorized
  - `403` akses ditolak
  - `404` data tidak ditemukan
  - `500` server error
