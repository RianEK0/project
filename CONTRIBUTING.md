# Contribution Guide

Thank you for contributing to Enterprise HRIS. This document explains the contribution standards that help keep changes consistent, secure, and easy to review.

## Principles

- Keep business rules inside the service layer or module application layer.
- Avoid placing complex domain logic inside controllers.
- Always include tests for behavior changes.
- Update documentation when endpoints, workflows, or project structure change.
- Prioritize backward compatibility for internal public APIs.

## Local Setup

Follow the setup guide in [docs/guides/installation.md](docs/guides/installation.md).

## Branching Recommendation

Use descriptive branch names, for example:

- `feature/attendance-shift-api`
- `fix/payroll-approval-bug`
- `docs/deployment-guide-update`
- `refactor/recruitment-service-cleanup`

## Commit Recommendation

Use clear commits focused on one logical change per commit.

Examples:

- `feat: add payroll approval inbox api`
- `fix: prevent duplicate attendance holiday insert`
- `docs: expand installation and deployment guides`

## Pull Request Checklist

Before opening a PR, make sure:

- the code runs successfully
- relevant tests pass
- documentation is updated for behavior changes
- no secrets or credentials are accidentally committed
- migration impact has been reviewed

## Backend Standards

- Controllers handle the request, response, and authorization boundary.
- Validation belongs in `app/Http/Requests`.
- Response transformation belongs in `app/Http/Resources`.
- Business logic belongs in `src/Modules/<Domain>/Application/Services`.
- Repository contracts belong in `src/Modules/<Domain>/Domain/Contracts`.
- Eloquent implementations belong in `src/Modules/<Domain>/Infrastructure`.

## Frontend Standards

- Use feature-based folders in `frontend/src/features`.
- Place reusable UI primitives in `frontend/src/components/ui`.
- Centralize API access in `*-api.ts` files.
- Do not mix networking logic into presentational components when it can be separated.

## Testing Expectations

### Backend

Run:

```bash
cd backend
php artisan test
```

Use the following test types as needed:

- Unit tests for utilities, policies, helpers, DTOs, and middleware behavior
- Feature tests for cross-layer workflows
- API tests for endpoint contracts, auth, pagination, filtering, sorting, and search

### Frontend

Minimum verification:

```bash
cd frontend
npm run typecheck
npm run build
```

## Documentation Expectations

Update documentation when changes affect:

- API routes
- environment variables
- deployment flow
- folder structure
- approval workflows
- the ERD or data relationships

Documents that usually need review:

- `README.md`
- `docs/api/README.md`
- `docs/guides/installation.md`
- `docs/guides/deployment.md`
- `docs/architecture/*`
- `docs/database/*`

## Review Focus

When reviewing a PR, prioritize:

- behavioral regressions
- authorization gaps
- data integrity
- audit trail consistency
- API compatibility
- test coverage impact

## Security Reminders

- Do not commit `.env` files.
- Do not hardcode secrets.
- Do not weaken guards or middleware without a clear reason.
- Make sure auth and permission changes include tests.
