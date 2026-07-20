# Contribution Guide

Terima kasih sudah berkontribusi pada Enterprise HRIS. Dokumen ini menjelaskan standar kontribusi agar perubahan tetap konsisten, aman, dan mudah direview.

## Principles

- Jaga business rule tetap berada di service layer atau module application layer
- Hindari menaruh logika domain kompleks di controller
- Selalu sertakan test untuk perubahan behavior
- Update dokumentasi jika endpoint, workflow, atau struktur project berubah
- Prioritaskan backward compatibility untuk API publik internal

## Local Setup

Ikuti panduan pada [docs/guides/installation.md](docs/guides/installation.md).

## Branching Recommendation

Gunakan naming yang deskriptif, misalnya:

- `feature/attendance-shift-api`
- `fix/payroll-approval-bug`
- `docs/deployment-guide-update`
- `refactor/recruitment-service-cleanup`

## Commit Recommendation

Gunakan commit yang jelas dan fokus pada satu perubahan logis per commit.

Contoh:

- `feat: add payroll approval inbox api`
- `fix: prevent duplicate attendance holiday insert`
- `docs: expand installation and deployment guides`

## Pull Request Checklist

Sebelum membuka PR, pastikan:

- kode dapat dijalankan
- test yang relevan lulus
- dokumentasi diperbarui jika ada perubahan behavior
- tidak ada secret atau credential yang ikut ter-commit
- perubahan migration sudah direview dampaknya

## Backend Standards

- Controller menangani request, response, dan authorization boundary
- Validation berada di `app/Http/Requests`
- Response transformation berada di `app/Http/Resources`
- Business logic berada di `src/Modules/<Domain>/Application/Services`
- Repository contract berada di `src/Modules/<Domain>/Domain/Contracts`
- Eloquent implementation berada di `src/Modules/<Domain>/Infrastructure`

## Frontend Standards

- Gunakan folder berbasis feature di `frontend/src/features`
- Tempatkan reusable UI primitive di `frontend/src/components/ui`
- Centralize API access di file `*-api.ts`
- Jangan campur logic networking ke komponen presentational jika bisa dipisah

## Testing Expectations

### Backend

Jalankan:

```bash
cd backend
php artisan test
```

Gunakan jenis test berikut sesuai kebutuhan:

- Unit Test untuk utility, policy, helper, DTO, middleware behavior
- Feature Test untuk workflow lintas layer
- API Test untuk kontrak endpoint, auth, pagination, filter, sorting, dan search

### Frontend

Minimal verifikasi:

```bash
cd frontend
npm run typecheck
npm run build
```

## Documentation Expectations

Update dokumentasi jika perubahan menyentuh:

- route API
- environment variable
- deployment flow
- folder structure
- workflow approval
- ERD atau relasi data

Dokumen yang biasanya perlu dicek:

- `README.md`
- `docs/api/README.md`
- `docs/guides/installation.md`
- `docs/guides/deployment.md`
- `docs/architecture/*`
- `docs/database/*`

## Review Focus

Saat mereview PR, prioritaskan:

- behavioral regression
- authorization gap
- data integrity
- audit trail consistency
- API compatibility
- test coverage impact

## Security Reminders

- Jangan commit `.env`
- Jangan hardcode secret
- Jangan menurunkan guard atau middleware tanpa alasan yang jelas
- Pastikan perubahan auth dan permission memiliki test
