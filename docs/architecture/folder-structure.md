# Folder Structure

This document explains the project's main folder structure and the responsibility of each area.

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
  - receives HTTP requests
  - calls services
  - returns JSON responses
- Requests
  - validation rules
  - request-level normalization
- Resources
  - response transformation
- Middleware
  - active session, permission, role, input sanitization, secure headers

### `app/Policies`

- Resource-based authorization
- Suitable for access rules such as employee visibility, leave approvals, and audit access

### `app/Notifications`, `app/Events`, `app/Listeners`

- Event-driven workflows
- Suitable for email verification, leave approval notifications, employee provisioning, and broadcast flows

### `src/Modules`

Each core business domain lives here:

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

- repository contracts
- domain-facing abstractions

### `src/Modules/<Domain>/Infrastructure`

- Eloquent model
- repository implementation
- persistence concerns

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
- buttons, cards, inputs, labels, badges, and similar primitives

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

When adding a new domain:

1. Create the folder `backend/src/Modules/<Domain>`
2. Place services in `Application`
3. Place contracts in `Domain`
4. Place Eloquent implementations in `Infrastructure`
5. Add requests, controllers, and resources in `app/Http`
6. Add feature tests and API tests
7. Update the API documentation, ERD, and README when needed

## Rules for Adding New Frontend Features

When adding a new workspace:

1. Create the folder `frontend/src/features/<feature-name>`
2. Keep page files and API helpers separate
3. Register the route in `src/app/router.tsx`
4. Update environment handling if new dependencies are introduced
