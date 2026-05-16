# FinTrack System

FinTrack System berisi backend ASP.NET Core Web API dan demo frontend statis untuk simulasi workflow finansial, approval transaksi, report, import CSV, dan audit log.

## Struktur

- `FinTrackSystemApi/` - Backend ASP.NET Core Web API dengan SQL Server, JWT authentication, dan role based authorization.
- `FinTrackSystemDemo/` - Demo frontend statis berbasis HTML, CSS, dan JavaScript.

## Menjalankan API

```bash
cd FinTrackSystemApi
docker compose up -d
dotnet restore
dotnet run
```

API berjalan di:

- `http://localhost:5042`
- `https://localhost:7042`

Dokumentasi API lebih lengkap ada di `FinTrackSystemApi/README.md`.

## Menjalankan Demo

Buka `FinTrackSystemDemo/index.html` di browser.
