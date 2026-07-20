# Enterprise HRIS

Enterprise HRIS adalah monorepo Human Resource Information System dengan backend Laravel 12 API modular dan frontend React 19. Repo ini dirancang untuk kebutuhan HR enterprise: autentikasi modern, RBAC, employee management, struktur organisasi, attendance, leave, payroll, recruitment, performance, IT asset, notifications, executive dashboard, dan audit trail.

## Highlights

- Backend modular dengan Service Layer, DTO, repository contract, policy, middleware permission, queue, scheduler, event, dan notification.
- Frontend React + TypeScript dengan feature-based structure untuk dashboard dan seluruh workspace HR.
- PostgreSQL, Redis, Mailpit, Nginx, dan Docker Compose untuk local stack maupun deployment containerized.
- REST API JSON dengan JWT authentication, refresh token, session management, pagination, filtering, sorting, dan search.
- Dokumentasi terpusat untuk instalasi, deployment, API, ERD, flowchart, folder structure, dan contribution workflow.

## Tech Stack

- Backend: Laravel 12, PHP 8.2+ runtime, JWT Auth, PHPUnit
- Frontend: React 19, TypeScript, Vite, TanStack Query, React Hook Form, Zod
- Database: PostgreSQL
- Cache and Queue: Redis
- Mail Testing: Mailpit
- Web Server: Nginx
- Containers: Docker Compose

## Module Coverage

- Access Control and Security
  - Login, logout, forgot password, reset password, email verification, remember me, multi-device session, refresh token, Google Authenticator 2FA, captcha, lockout, login history, password history
- Workforce
  - Employee profile lengkap, document upload, salary and contract history, audit log
- Organization
  - Company, branch, department, division, section, position, manager, reporting line, organization chart
- Attendance
  - Clock in/out, GPS and photo validation, QR attendance, manual attendance, correction, approval, shift, holiday, overtime, report
- Leave
  - Leave type, balance, calendar, request, approval, reminder-oriented workspace
- Payroll
  - Payroll run, approval, payslip, PDF and Excel export, payroll history, adjustment item
- Recruitment
  - Vacancy, candidate, application, interview, assessment, hiring pipeline
- Performance
  - Cycle, KPI/OKR/goal, review, feedback, manager and employee review
- IT Assets
  - Asset registry, assignment, return, maintenance, warranty, QR history support
- Notifications
  - Email, in-app, push-ready, WhatsApp-ready, Slack-ready, Microsoft Teams-ready
- Governance
  - Audit log, executive dashboard, operational timeline

## Screenshots

### Login

![Login Page](screenshots/login-page.png)

### Executive Dashboard

![Executive Dashboard](screenshots/dashboard.png)

### Employee Management

![Employee Management](screenshots/employees.png)

### Leave Workspace

![Leave Workspace](screenshots/leave.png)

### Organization Structure

![Organization Structure](screenshots/organization.png)

## Monorepo Layout

- `backend`
  Laravel API, business modules, migrations, seeders, tests
- `frontend`
  React application untuk dashboard dan seluruh workspace HR
- `docker`
  Dockerfile PHP-FPM, entrypoint, health check, dan konfigurasi Nginx
- `docs`
  Seluruh dokumentasi teknis, operasional, API, ERD, dan arsitektur
- `screenshots`
  Screenshot referensi UI

## Quick Start

### Local Backend

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan jwt:secret
php artisan migrate:fresh --seed
php artisan serve
```

Jika ingin menjalankan worker dan scheduler secara lokal:

```bash
php artisan queue:work
php artisan schedule:run
```

### Local Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Full Stack via Docker

```bash
docker compose up --build
docker compose exec laravel php artisan migrate --seed
```

Frontend tersedia sebagai profile opsional:

```bash
docker compose --profile frontend up --build
```

## Default Access

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

## Useful Endpoints

- API Base URL: `http://localhost:8000/api/v1`
- Laravel Health Endpoint: `http://localhost:8000/up`
- Frontend Dev URL: `http://localhost:5173`
- Mailpit UI: `http://localhost:8025`

## Available Scripts

### Backend

```bash
cd backend
composer test
php artisan test
```

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run typecheck
npm run lint
```

## Documentation Map

- Documentation Index: [docs/README.md](docs/README.md)
- Installation Guide: [docs/guides/installation.md](docs/guides/installation.md)
- Deployment Guide: [docs/guides/deployment.md](docs/guides/deployment.md)
- Architecture Overview: [docs/architecture/overview.md](docs/architecture/overview.md)
- Folder Structure: [docs/architecture/folder-structure.md](docs/architecture/folder-structure.md)
- Flowchart: [docs/architecture/flowchart.md](docs/architecture/flowchart.md)
- API Documentation: [docs/api/README.md](docs/api/README.md)
- OpenAPI Spec: [docs/api/openapi.yaml](docs/api/openapi.yaml)
- ERD: [docs/database/erd.md](docs/database/erd.md)
- Domain Data Diagram: [docs/database/diagram.md](docs/database/diagram.md)
- Contribution Guide: [CONTRIBUTING.md](CONTRIBUTING.md)

## Notes

- Docker Compose configuration sudah mencakup `laravel`, `nginx`, `postgres`, `redis`, `mailpit`, `queue`, dan `scheduler`.
- Docker binary belum tersedia di environment kerja saat dokumentasi ini diperbarui pada Monday, July 20, 2026, jadi validasi yang dilakukan di sini bersifat file-level dan command-level, bukan container runtime verification.
