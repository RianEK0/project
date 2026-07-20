# Installation Guide

Panduan ini mencakup dua mode instalasi:

1. Local native development
2. Docker Compose development stack

## Prerequisites

### Native Development

- PHP `8.2` atau lebih baru
- Composer `2.x`
- Node.js `22.x`
- npm `10.x` atau yang kompatibel
- PostgreSQL `17` jika ingin memakai PostgreSQL lokal
- Redis `8` jika ingin queue, cache, dan session berjalan sesuai environment production-like

### Docker Development

- Docker Engine
- Docker Compose Plugin

## Repository Setup

```bash
git clone <repository-url>
cd "Enterprise HRIS (Human Resource Information System)"
```

## Option A: Native Development

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan jwt:secret
```

### 2. Database Configuration

Ada dua pendekatan yang disarankan:

- SQLite untuk setup tercepat
- PostgreSQL untuk behavior yang lebih mirip deployment

#### SQLite

Sesuaikan `.env`:

```env
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/backend/database/database.sqlite
QUEUE_CONNECTION=database
CACHE_STORE=file
SESSION_DRIVER=database
```

Lalu buat file database:

```bash
touch database/database.sqlite
```

#### PostgreSQL

Sesuaikan `.env`:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=enterprise_hris
DB_USERNAME=postgres
DB_PASSWORD=postgres
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
QUEUE_CONNECTION=redis
CACHE_STORE=redis
SESSION_DRIVER=database
```

Catatan penting:

- Jangan gunakan `DB_HOST=postgres` jika Anda tidak sedang berada di dalam network Docker Compose.
- Host `postgres` hanya valid dari dalam container stack Docker.

### 3. Migrate and Seed

```bash
php artisan migrate:fresh --seed
```

### 4. Run Backend

```bash
php artisan serve
```

Jika queue dan scheduler juga dibutuhkan:

```bash
php artisan queue:work
php artisan schedule:run
```

### 5. Frontend Setup

Pindah ke root repo lalu:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Option B: Docker Compose

### 1. Start Core Stack

```bash
docker compose up --build
```

Service default:

- `laravel`
- `nginx`
- `postgres`
- `redis`
- `mailpit`
- `queue`
- `scheduler`

### 2. Run Database Migration and Seeder

```bash
docker compose exec laravel php artisan migrate --seed
```

### 3. Run Frontend Profile

Jika ingin frontend dev server juga aktif:

```bash
docker compose --profile frontend up --build
```

## Post-Install Verification

Pastikan endpoint berikut dapat diakses:

- API: `http://localhost:8000/api/v1`
- Health: `http://localhost:8000/up`
- Frontend: `http://localhost:5173`
- Mailpit: `http://localhost:8025`

## Seed Accounts

- Administrator
  - Email: `admin@enterprise-hris.local`
  - Password: `Password123!`
- HR Manager
  - Email: `rafi.saputra@enterprise-hris.local`
  - Password: `Password123!`
- Department Manager
  - Email: `alya.pratama@enterprise-hris.local`
  - Password: `Password123!`
- Employee
  - Email: `nadia.putri@enterprise-hris.local`
  - Password: `Password123!`

## Recommended First Commands

### Backend

```bash
php artisan route:list
php artisan test
```

### Frontend

```bash
npm run typecheck
npm run build
```

## Troubleshooting

### JWT secret missing

```bash
php artisan jwt:secret
```

### Application key missing

```bash
php artisan key:generate
```

### Database connection failure in native mode

Periksa bahwa Anda tidak memakai `DB_HOST=postgres` di luar Docker.

### Mail not visible

Pastikan `MAIL_HOST=mailpit` hanya dipakai di Docker. Untuk native mode, ganti ke SMTP lokal Anda atau jalankan Mailpit sendiri.
