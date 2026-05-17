# Panduan Deployment Komdigi HRIS

## Opsi Deployment

Aplikasi ini dapat dijalankan:

- secara lokal untuk development
- di VPS Linux
- di platform container seperti Docker

Dokumen ini berfokus pada dua cara:

- deployment sederhana dengan `Node.js` di server Linux
- deployment cepat memakai `Docker`

## 1. Persiapan Server

Pastikan server sudah memiliki:

- Node.js 20+
- npm
- git
- reverse proxy seperti Nginx

## 2. Clone Project

```bash
git clone <repo-url>
cd komdigi-hris
```

## 3. Setup Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
```

Buat file `.env` backend bila diperlukan:

```bash
PORT=5001
JWT_SECRET=ganti-dengan-secret-yang-aman
```

Jalankan backend:

```bash
npm start
```

Untuk production, gunakan process manager:

```bash
npm install -g pm2
pm2 start src/index.js --name komdigi-backend
pm2 save
```

## 4. Setup Frontend

```bash
cd ../frontend
npm install
```

Buat `.env` frontend:

```bash
VITE_API_URL=https://domain-anda/api
```

Build frontend:

```bash
npm run build
```

Hasil build ada di folder `frontend/dist`.

Pada mode production terbaru, backend dapat langsung melayani folder `frontend/dist`, sehingga frontend dan backend bisa berjalan pada satu domain yang sama.

## 5. Konfigurasi Nginx

Contoh sederhana:

```nginx
server {
    listen 80;
    server_name domain-anda.com;

    root /path/ke/komdigi-hris/frontend/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:5001/uploads/;
    }
}
```

## 6. Opsi Docker

Project ini sudah dilengkapi:

- `Dockerfile`
- `docker-compose.production.yml`

Jalankan:

```bash
docker compose -f docker-compose.production.yml up --build -d
```

Aplikasi akan tersedia di:

```text
http://localhost:5001
```

Endpoint health check:

```text
http://localhost:5001/healthz
```

## 7. Keamanan Production

Yang sebaiknya ditambahkan saat production:

- HTTPS
- JWT secret yang kuat
- pembatasan upload file
- backup database berkala
- rotasi log
- firewall server
- rate limiting API

## 8. Rekomendasi Migrasi Database

Untuk production skala lebih besar, sebaiknya pindah dari SQLite ke:

- PostgreSQL
- MySQL

Langkahnya:

1. ubah provider Prisma
2. ganti connection string
3. jalankan migrasi ulang
