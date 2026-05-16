# FinTrack System API

Backend demo untuk FinTrack System menggunakan ASP.NET Core Web API, C#, Entity Framework Core, SQL Server, JWT Authentication, dan Role Based Authorization.

## Akun Demo

| Username | Password | Role |
| --- | --- | --- |
| admin | password | Super Admin |
| finance | password | Finance Staff |
| manager | password | Manager |
| auditor | password | Auditor |

## Role Access

- Super Admin: semua endpoint.
- Finance Staff: customer, transaction, import, report.
- Manager: transaction, approval, report, audit log.
- Auditor: report dan audit log.

## Menjalankan SQL Server dengan Docker

```bash
cd FinTrackSystemApi
docker compose up -d
```

Connection string default:

```json
"Server=localhost,1433;Database=FinTrackSystemDb;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;Encrypt=True;"
```

## Menjalankan API

Pastikan .NET SDK sudah terpasang.

```bash
cd FinTrackSystemApi
dotnet restore
dotnet run
```

API akan berjalan di:

- `http://localhost:5042`
- `https://localhost:7042`

Saat startup pertama, aplikasi membuat database dan seed data demo otomatis memakai EF Core `EnsureCreated`.

## Endpoint

### Authentication

- `POST /api/auth/login`
- `POST /api/auth/register`

### Customer

- `GET /api/customers`
- `GET /api/customers/{id}`
- `POST /api/customers`
- `PUT /api/customers/{id}`
- `DELETE /api/customers/{id}`

### Transaction

- `GET /api/transactions`
- `GET /api/transactions/{id}`
- `POST /api/transactions`
- `PUT /api/transactions/{id}`
- `DELETE /api/transactions/{id}`
- `PUT /api/transactions/{id}/approve`
- `PUT /api/transactions/{id}/reject`

### Report

- `GET /api/reports/transactions`

Query optional:

- `dateFrom=2026-05-01`
- `dateTo=2026-05-31`
- `status=Success`
- `type=Transfer`
- `auditExport=true`

### ETL

- `POST /api/import/transactions`

Gunakan `multipart/form-data` dengan field file bernama `file`.

### Audit Log

- `GET /api/audit-logs`

Endpoint ini tambahan backend untuk mendukung halaman Audit Log.

## Contoh Login

```http
POST http://localhost:5042/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

Gunakan nilai `data.token` dari response sebagai Bearer token:

```http
Authorization: Bearer TOKEN_ANDA
```

## Catatan Migration

Project ini disiapkan agar langsung jalan dengan `EnsureCreated`. Untuk production-style workflow, ganti seeding startup ke migration:

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

Lalu ubah `DbSeeder` dari `EnsureCreatedAsync` ke `MigrateAsync`.
