# Kasir Warung Pintar

Aplikasi kasir dan stok barang responsive/PWA untuk warung, toko kelontong, dan toko kecil. Data stok, transaksi, riwayat stok, dan pengaturan disimpan di database cloud Supabase agar sinkron antar perangkat.

## Instalasi Awal

1. `npm create vite@latest kasir-warung-pintar`
2. Pilih `React` dan `JavaScript`
3. `cd kasir-warung-pintar`
4. `npm install`
5. `npm run dev`

Jika memakai folder ini langsung:

```bash
cd kasir-warung-pintar
npm install
```

## Setup Supabase

1. Buat project di Supabase.
2. Buka `SQL Editor`.
3. Jalankan seluruh isi file `database/supabase.sql`.
4. Buka `Project Settings` > `API`.
5. Salin `Project URL` dan `anon public key`.
6. Salin `.env.example` menjadi `.env`, lalu isi:

```bash
VITE_SUPABASE_URL=https://PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

7. Jalankan aplikasi:

```bash
npm run dev
```

## Akses dari Smartphone Jaringan Berbeda

Alamat `localhost` atau `192.168.x.x` hanya cocok untuk laptop sendiri atau satu Wi-Fi. Agar HP di jaringan internet berbeda bisa membuka aplikasi:

1. Deploy ke hosting HTTPS seperti Vercel, Netlify, atau Cloudflare Pages.
2. Set environment variable `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di hosting.
3. Jalankan build command `npm run build`.
4. Publish folder `dist`.
5. Buka URL HTTPS hasil deploy dari smartphone, lalu pilih `Add to Home Screen`.

## Database Cloud

Schema Supabase membuat:

- `products`
- `transactions`
- `transaction_items`
- `stock_movements`
- `app_settings`
- RPC `complete_sale` untuk checkout atomik dan validasi stok
- RPC `record_stock_movement` untuk stok masuk/keluar atomik
- Supabase Realtime untuk sinkron antar perangkat

## Catatan Keamanan

Schema contoh memakai anon key dengan policy publik agar aplikasi langsung berjalan tanpa login. Untuk produksi multi-toko, tambahkan Supabase Auth dan batasi Row Level Security per akun/toko.

## Catatan Kamera Barcode

Scanner memakai kamera smartphone dan `BarcodeDetector` bawaan browser jika tersedia. Di Android Chrome modern fitur ini bekerja di `localhost` atau koneksi HTTPS. Jika browser belum mendukung, aplikasi tetap menyediakan input barcode manual.
