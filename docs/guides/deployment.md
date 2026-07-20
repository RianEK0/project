# Deployment Guide

Dokumen ini menjelaskan deployment untuk Enterprise HRIS dengan fokus utama pada containerized deployment. Semua langkah di bawah diasumsikan dilakukan setelah Monday, July 20, 2026, pada environment yang sudah memenuhi requirement runtime project.

## Supported Deployment Models

1. Docker Compose pada single VM atau VPS
2. Manual deployment Laravel + React pada server terpisah

Model yang paling direkomendasikan untuk repo ini adalah Docker Compose, karena file stack dan dependency service sudah tersedia di repository.

## Production Components

- Laravel API
- Nginx reverse proxy
- PostgreSQL
- Redis
- Queue worker
- Scheduler
- Mail provider production
- HTTPS termination

## Pre-Deployment Checklist

- Domain dan DNS sudah diarahkan ke server
- HTTPS certificate tersedia
- PostgreSQL dan Redis sudah memiliki capacity planning yang memadai
- File `.env` production sudah disiapkan
- Backup strategy database sudah didefinisikan
- Queue worker dan scheduler sudah dipastikan ikut berjalan
- `APP_DEBUG=false`
- `APP_ENV=production`
- `LOG_LEVEL=info` atau `warning`

## Recommended Production Environment Variables

Contoh nilai inti:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://hris.example.com
FRONTEND_URL=https://hris.example.com

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=enterprise_hris
DB_USERNAME=enterprise_hris
DB_PASSWORD=strong-password

REDIS_CLIENT=predis
REDIS_HOST=redis
REDIS_PORT=6379

QUEUE_CONNECTION=redis
CACHE_STORE=redis
SESSION_DRIVER=database

MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=mailer-user
MAIL_PASSWORD=mailer-password
MAIL_FROM_ADDRESS=no-reply@example.com
MAIL_FROM_NAME="Enterprise HRIS"
```

## Docker Compose Deployment

### 1. Prepare Server

- Install Docker Engine
- Install Docker Compose Plugin
- Pastikan port `80` dan `443` dapat diakses
- Siapkan directory deployment

### 2. Clone Repository

```bash
git clone <repository-url> /srv/enterprise-hris
cd /srv/enterprise-hris
```

### 3. Configure Environment

```bash
cp backend/.env.example backend/.env
```

Sesuaikan `backend/.env` untuk environment production.

### 4. Start Stack

```bash
docker compose up -d --build
```

### 5. Run One-Time Application Commands

```bash
docker compose exec laravel php artisan migrate --force
docker compose exec laravel php artisan db:seed --force
docker compose exec laravel php artisan optimize
```

Jika ini bukan first deployment, jalankan seeder hanya jika memang dibutuhkan.

### 6. Verify Health

Periksa:

- `http://your-domain/up`
- `docker compose ps`
- `docker compose logs laravel`
- `docker compose logs nginx`
- `docker compose logs queue`
- `docker compose logs scheduler`

## Frontend Deployment Options

### Option A: Frontend Built Separately

- Build frontend menjadi static assets
- Serve melalui Nginx/CDN terpisah
- Arahkan `VITE_API_BASE_URL` ke domain API

### Option B: Frontend Dev Profile

Profile frontend pada `docker-compose.yml` lebih cocok untuk development atau staging, bukan production final.

Untuk production, lebih baik frontend dibuild dan di-host sebagai static assets yang immutable.

## HTTPS and Reverse Proxy

Repo ini menyediakan Nginx untuk application gateway internal, tetapi untuk production Anda tetap disarankan memakai salah satu pendekatan berikut:

- Nginx host-level
- Traefik
- Caddy
- Cloud load balancer dengan TLS termination

Minimum checklist:

- Force HTTPS
- Set `APP_URL` dan `FRONTEND_URL` ke `https://...`
- Gunakan trusted proxies yang sesuai

## Queue and Scheduler

Queue worker dan scheduler adalah bagian wajib untuk fitur berikut:

- Notification delivery
- Leave approval notification
- Employee provisioning notification
- Scheduled workforce snapshot

Pastikan service `queue` dan `scheduler` selalu aktif.

## Post-Deployment Smoke Test

Lakukan verifikasi berikut:

1. Endpoint `/up` mengembalikan `200`
2. Login berhasil dengan akun seed atau admin production
3. Endpoint `/api/v1/dashboard` bisa diakses setelah login
4. Queue worker menerima job baru
5. Mail provider bisa mengirim email
6. Storage writable untuk upload dokumen

## Backup Strategy

Minimal backup yang direkomendasikan:

- PostgreSQL daily full backup
- WAL or incremental strategy jika kebutuhan audit tinggi
- Backup volume upload penting dari Laravel storage
- Simpan backup di lokasi terpisah dari host utama

## Rollback Strategy

Minimum rollback plan:

1. Tag image atau commit deployment
2. Simpan backup database sebelum migration besar
3. Jika deployment gagal:
   - rollback image/application
   - restore database jika migration bersifat destructive

## Observability

Disarankan menambahkan:

- Centralized log aggregation
- PostgreSQL monitoring
- Redis monitoring
- Error tracking
- Health endpoint monitoring
- Disk usage monitoring untuk upload dan logs

## Security Checklist

- `APP_DEBUG=false`
- Password dan secret tidak disimpan di repository
- Gunakan JWT secret unik per environment
- Gunakan SMTP production dengan kredensial aman
- Batasi akses database dan Redis ke network internal
- Terapkan HTTPS end-to-end
- Lakukan rotasi credential berkala

## Upgrade Notes

Sebelum upgrade aplikasi:

1. Jalankan test suite
2. Review migration yang akan dieksekusi
3. Backup database
4. Deploy ke staging terlebih dahulu
5. Baru deploy ke production
