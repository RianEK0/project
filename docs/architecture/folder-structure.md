# Folder Structure

Dokumen ini menjelaskan struktur folder utama project dan tanggung jawab setiap area.

## Root Structure

```text
.
|-- backend/
|-- frontend/
|-- docker/
|-- docs/
|-- screenshots/
|-- scripts/
|-- docker-compose.yml
|-- README.md
|-- CONTRIBUTING.md
```

## Backend Structure

```text
backend/
|-- app/
|   |-- Console/
|   |-- Events/
|   |-- Http/
|   |   |-- Controllers/
|   |   |-- Middleware/
|   |   |-- Requests/
|   |   `-- Resources/
|   |-- Listeners/
|   |-- Models/
|   |-- Notifications/
|   |-- Policies/
|   |-- Providers/
|   `-- Services/
|-- bootstrap/
|-- config/
|-- database/
|   |-- factories/
|   |-- migrations/
|   `-- seeders/
|-- public/
|-- resources/
|-- routes/
|-- src/
|   |-- Modules/
|   `-- Shared/
|-- storage/
`-- tests/
```

## What Goes Where in Backend

### `app/Http`

- Controller
  - menerima HTTP request
  - memanggil service
  - mengembalikan JSON response
- Requests
  - validation rule
  - request-level normalization
- Resources
  - response transformation
- Middleware
  - active session, permission, role, input sanitization, secure headers

### `app/Policies`

- Authorization berbasis resource
- Cocok untuk aturan akses seperti employee visibility, leave approval, dan audit access

### `app/Notifications`, `app/Events`, `app/Listeners`

- Event-driven workflow
- Cocok untuk email verification, leave approval notification, employee provisioning, dan broadcast flow

### `src/Modules`

Setiap domain business utama berada di sini:

- `AccessControl`
- `Assets`
- `Attendance`
- `Governance`
- `Leave`
- `Notifications`
- `Organization`
- `Payroll`
- `Performance`
- `Recruitment`
- `Workforce`

### `src/Modules/<Domain>/Application`

- service
- DTO
- use-case orchestration

### `src/Modules/<Domain>/Domain`

- repository contract
- domain-facing abstraction

### `src/Modules/<Domain>/Infrastructure`

- Eloquent model
- repository implementation
- persistence concern

### `src/Shared`

- `ApiResponse`
- `ListQueryOptions`
- `CollectionQuery`
- `CollectionPaginator`
- base `DataTransferObject`

## Frontend Structure

```text
frontend/
|-- public/
|-- src/
|   |-- app/
|   |-- assets/
|   |-- components/
|   |   `-- ui/
|   |-- features/
|   |   |-- access-control/
|   |   |-- assets/
|   |   |-- attendance/
|   |   |-- auth/
|   |   |-- dashboard/
|   |   |-- governance/
|   |   |-- leave/
|   |   |-- notifications/
|   |   |-- organization/
|   |   |-- payroll/
|   |   |-- performance/
|   |   |-- recruitment/
|   |   `-- workforce/
|   |-- lib/
|   `-- types/
|-- package.json
`-- vite.config.ts
```

## What Goes Where in Frontend

### `src/app`

- router
- global provider
- app shell wiring

### `src/features`

- page-level and feature-level logic
- API client per domain
- view model and component composition per workspace

### `src/components/ui`

- reusable UI primitives
- button, card, input, label, badge, dan sejenisnya

### `src/lib`

- HTTP client wrapper
- environment variable mapping
- utility helper

## Documentation Structure

```text
docs/
|-- README.md
|-- api/
|   |-- README.md
|   `-- openapi.yaml
|-- architecture/
|   |-- overview.md
|   |-- folder-structure.md
|   `-- flowchart.md
|-- database/
|   |-- erd.md
|   `-- diagram.md
`-- guides/
    |-- installation.md
    `-- deployment.md
```

## Docker Structure

```text
docker/
|-- nginx/
|   `-- default.conf
`-- php/
    |-- Dockerfile
    |-- entrypoint.sh
    |-- healthcheck.sh
    |-- php.ini
    `-- www.conf
```

## Rules for Adding New Backend Modules

Jika menambah domain baru:

1. Buat folder `backend/src/Modules/<Domain>`
2. Tempatkan service di `Application`
3. Tempatkan contract di `Domain`
4. Tempatkan Eloquent implementation di `Infrastructure`
5. Tambahkan request, controller, dan resource di `app/Http`
6. Tambahkan feature test dan API test
7. Perbarui dokumentasi API, ERD, dan README bila perlu

## Rules for Adding New Frontend Features

Jika menambah workspace baru:

1. Buat folder `frontend/src/features/<feature-name>`
2. Pisahkan file page dan API helper
3. Daftarkan route di `src/app/router.tsx`
4. Perbarui env handling bila ada dependency baru
