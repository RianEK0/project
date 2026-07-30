# NovaERP Architecture

## Vision

NovaERP dibangun sebagai SaaS enterprise multi-tenant yang bisa melayani berbagai vertikal bisnis tanpa membuat kode inti menjadi rapuh. Fokus arsitektur awal adalah kestabilan domain, kemudahan ekspansi modul, dan batas tanggung jawab yang jelas.

## High-Level Layers

### Frontend

- `app/`: route, layout, dan server component entrypoint.
- `components/`: UI reusable dan module-specific presentation.
- `lib/`: client utilities, constants, dan adapter.
- `store/`: state lokal lintas halaman yang ringan.

### Backend

- `modules/`: business capability per bounded context.
- `common/`: cross-cutting concerns seperti response, filter, logger, guard, interceptor.
- `config/`: environment parsing dan app-level settings.
- `database/`: Prisma integration, repository bootstrap, dan future seed/migration helpers.

## Architectural Style

- Clean Architecture untuk memisahkan domain, use case, dan infrastructure.
- Service layer untuk orchestration business rule.
- Repository pattern dipakai di fase implementasi data access agar Prisma tidak langsung bocor ke controller.
- DTO dan validation dipakai di boundary API.
- Dependency injection memanfaatkan container bawaan NestJS.

## Multi-Tenant Strategy

- Tenant utama direpresentasikan oleh `Organization`.
- User dapat menjadi anggota banyak organisasi melalui `OrganizationMember`.
- Role permission bersifat dinamis dan bisa berbeda per organisasi.
- Konteks tenant akan menjadi mandatory di request lifecycle untuk seluruh module transaksional.

## Core Cross-Cutting Features

- Authentication: email/password, refresh token, OTP, verification, 2FA, social login.
- Authorization: dynamic RBAC + permission scope.
- Auditability: `AuditLog`, `ActivityLog`, `GeneratedReport`, `AiPromptLog`, `QueueJob`.
- File handling: folder, file asset, versioning.
- Notification: in-app, email, WhatsApp-ready, and browser push-ready.
- Reporting: dashboard widget, generated report, export pipeline.

## Initial Module Priority

Fase implementasi pertama setelah fondasi:

1. Auth & access control
2. Dashboard shell + widget system
3. Booking
4. CRM
5. Finance
6. Warehouse

## Deployment Direction

- `apps/web` dijalankan sebagai Next.js node server atau container.
- `apps/api` dijalankan sebagai NestJS service.
- PostgreSQL dan Redis sebagai shared infra service.
- Nginx, CI/CD, dan PM2/container orchestration disiapkan pada fase deployment.

## Quality Guardrails

- TypeScript strict mode di seluruh workspace.
- Shared config untuk konsistensi linting dan typecheck.
- Reusable package boundaries untuk menghindari copy-paste antarmodul.
- Dokumentasi dibuat sejak fase scaffold agar domain decision mudah dilacak.
