# Enterprise HRIS

Enterprise HRIS is a modular, production-oriented Human Resource Information System built to match the expectations of modern enterprise software. This project combines a Laravel 12 API, a React 19 frontend, PostgreSQL-ready infrastructure, and a clean architectural structure designed for long-term scalability.

## Product Preview

The interface is presented as a focused HR operations workspace rather than a generic admin template. The screenshots below were captured from the running application in this repository.

<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="Enterprise HRIS dashboard" width="100%">
</p>

<p align="center">
  <img src="docs/screenshots/login-page.png" alt="Enterprise HRIS login screen" width="49%">
  <img src="docs/screenshots/employees.png" alt="Enterprise HRIS employee directory" width="49%">
</p>

<p align="center">
  <img src="docs/screenshots/organization.png" alt="Enterprise HRIS organization structure" width="49%">
  <img src="docs/screenshots/leave.png" alt="Enterprise HRIS leave operations" width="49%">
</p>

## What This Project Includes

- Enterprise-ready backend architecture with Clean Architecture, Repository Pattern, Service Layer, DTOs, policies, and middleware
- JWT authentication and role-based access control
- Workforce management foundation for employees, departments, and teams
- Organization structure management
- Leave request workflow from employee to manager and HR approval
- Governance support through audit logs and approval traceability
- Docker-ready infrastructure with Nginx, Redis, PostgreSQL, and Mailpit
- Supporting documentation including OpenAPI, ERD, and architecture notes

## Tech Stack

- Backend: Laravel 12, PHP 8.4 target runtime, REST API, PHPUnit
- Frontend: React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, React Hook Form, Zod, Axios, React Router
- Database: PostgreSQL
- Infrastructure: Docker, Docker Compose, Nginx, Redis, Mailpit

## Repository Structure

```text
.
├── backend
├── frontend
├── docker
├── docs
└── docker-compose.yml
```

- `backend`: Laravel API and modular business domains
- `frontend`: React application for the HR operations workspace
- `docker`: PHP and Nginx container configuration
- `docs`: architecture, API, and database documentation

## Implemented Modules

- Access Control
  - JWT login
  - role and permission management
  - policy-based authorization
- Dashboard
  - workforce summary
  - recent hires overview
- Workforce
  - employee directory
  - employee creation
  - department and team mapping
- Organization
  - organization structure
  - team registry
  - team setup workflow
- Leave Management
  - leave type catalog
  - leave request submission
  - manager to HR approval flow
- Governance
  - audit log feed
  - action tracking for workforce, organization, and leave modules

## Local Setup

### Backend

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan jwt:secret
touch database/database.sqlite
php artisan migrate:fresh --seed
php artisan serve
```

Local note:

- Do not run `php artisan migrate --seed` and `php artisan serve` on the same terminal line.
- If you are not using Docker, do not use `DB_HOST=postgres`.
- The hostname `postgres` only resolves inside the Docker Compose network.
- The fastest local setup uses SQLite.
- If you prefer local PostgreSQL, set `DB_HOST=127.0.0.1` or your own PostgreSQL host.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Full Stack with Docker

```bash
docker compose up --build
```

In Docker mode:

- the backend uses the internal PostgreSQL service with host `postgres`
- Redis, Nginx, and Mailpit run together as part of the stack

## Demo Accounts

- Administrator
  - Email: `admin@enterprise-hris.local`
  - Password: `Password123!`
- HR Manager
  - Email: `rafi.saputra@enterprise-hris.local`
  - Password: `Password123!`
- Manager
  - Email: `alya.pratama@enterprise-hris.local`
  - Password: `Password123!`
- Employee
  - Email: `nadia.putri@enterprise-hris.local`
  - Password: `Password123!`

## Verification Completed

The current implementation has already been validated with:

- `php artisan migrate:fresh --seed`
- `php artisan test`
- `npm run build`

## Documentation

- Architecture Overview: [docs/architecture/overview.md](docs/architecture/overview.md)
- OpenAPI Specification: [docs/api/openapi.yaml](docs/api/openapi.yaml)
- API Guide: [docs/api/README.md](docs/api/README.md)
- ERD: [docs/database/erd.md](docs/database/erd.md)
- Database Diagram: [docs/database/diagram.md](docs/database/diagram.md)

## Notes

- The target production runtime is PHP 8.4 through `docker/php/Dockerfile`.
- Local verification in this environment was performed with PHP 8.2 because that is the CLI version available on the machine.
- Docker could not be executed directly in this environment because the `docker` binary was not available during implementation.
