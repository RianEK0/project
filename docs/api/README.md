# API Documentation

OpenAPI source tersedia di [openapi.yaml](/Users/arian/Enterprise HRIS (Human Resource Information System)/docs/api/openapi.yaml).

## Main Endpoints

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/dashboard`
- `GET /api/v1/departments`
- `GET /api/v1/employees`
- `POST /api/v1/employees`
- `GET /api/v1/employees/{employee}`
- `PUT/PATCH /api/v1/employees/{employee}`
- `DELETE /api/v1/employees/{employee}`
- `GET /api/v1/organization/structure`
- `GET /api/v1/teams`
- `POST /api/v1/teams`
- `GET /api/v1/leave-types`
- `GET /api/v1/leave-requests`
- `POST /api/v1/leave-requests`
- `GET /api/v1/approvals/inbox`
- `POST /api/v1/leave-requests/{leaveRequest}/approve`
- `POST /api/v1/leave-requests/{leaveRequest}/reject`
- `GET /api/v1/audit-logs`

## Default Seed Credentials

- Administrator: `admin@enterprise-hris.local` / `Password123!`
- HR Manager: `rafi.saputra@enterprise-hris.local` / `Password123!`
- Manager: `alya.pratama@enterprise-hris.local` / `Password123!`
- Employee: `nadia.putri@enterprise-hris.local` / `Password123!`

## Auth Flow

1. Login ke endpoint JWT auth.
2. Simpan `access_token`.
3. Kirim header `Authorization: Bearer <token>` pada semua endpoint terproteksi.

## Enterprise Workflow Coverage

- Organization: struktur department dan team, termasuk team lead
- Leave: employee submit, manager approve, HR final approve atau reject
- Governance: audit log untuk perubahan penting di workforce, organization, dan leave
