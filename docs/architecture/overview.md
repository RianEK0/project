# Architecture Overview

Enterprise HRIS menggunakan pendekatan monorepo dengan pemisahan tegas antara API backend, frontend dashboard, container tooling, dan dokumentasi.

## Architectural Goals

- Modular untuk domain HRIS yang terus bertambah
- Mudah diuji melalui pemisahan service, contract, request, resource, dan policy
- Aman untuk operasi enterprise melalui auth modern, RBAC, audit log, queue, dan scheduler
- Mudah di-deploy secara lokal maupun containerized

## High-Level Topology

- Frontend React mengakses REST API Laravel melalui HTTP JSON
- Laravel API mengelola authentication, authorization, business workflow, persistence, dan audit
- PostgreSQL menjadi primary relational database
- Redis digunakan untuk cache, queue, dan state support
- Mailpit dipakai untuk mail testing di environment development
- Queue worker dan scheduler berjalan sebagai service terpisah pada Docker stack

## Backend Architecture

Backend mengikuti pola Laravel modular dengan domain-oriented structure:

- `app/Http`
  - Controller, request validation, API resource, middleware
- `app/Policies`
  - Authorization policy per resource
- `app/Providers`
  - Binding service container, policy, event registration
- `app/Notifications`, `app/Events`, `app/Listeners`
  - Cross-cutting asynchronous behavior
- `src/Modules`
  - Domain business logic utama
- `src/Shared`
  - Shared DTO base, response helper, pagination helper, collection query helper

## Module Inventory

### AccessControl

- JWT auth
- captcha
- refresh token
- session management
- login history
- password history
- 2FA setup and verification
- RBAC role and permission management

### Workforce

- employee management
- salary history
- contract history
- document management
- employee audit log

### Organization

- company hierarchy
- branch, department, division, section, position
- reporting line
- organization chart
- team management

### Leave

- leave type
- leave request
- leave balance
- approval inbox
- leave calendar and overview

### Attendance

- clock in and clock out
- manual attendance
- shift and holiday configuration
- attendance correction and approval
- attendance report

### Payroll

- payroll run
- payroll approval
- payroll item adjustment
- payslip
- PDF and Excel export

### Recruitment

- vacancy
- candidate
- application pipeline
- interview and assessment
- hire conversion

### Performance

- cycle
- goal
- review
- feedback
- overview and lookup workspace

### Assets

- asset registry
- assignment
- return
- maintenance
- lifecycle tracking

### Notifications

- in-app inbox
- delivery log
- broadcast
- channel configuration

### Governance

- audit logging
- executive dashboard support services

## Layering Inside Each Module

Umumnya tiap module mengikuti susunan berikut:

- `Application`
  - Use-case service dan DTO
- `Domain`
  - Contract atau interface dependency
- `Infrastructure`
  - Eloquent model, repository implementation, persistence detail

Prinsip dependency:

- Controller tidak mengetahui detail persistence
- Service menggunakan repository contract atau model yang relevan
- Shared helper dipakai untuk envelope response, pagination, filtering, sorting, dan search

## API Design Principles

- Semua fitur utama tersedia via REST API
- Format response menggunakan JSON envelope
- Pagination tersedia pada collection endpoint
- Filter, sorting, dan search tersedia secara konsisten
- Permission middleware digunakan di level route
- Policy digunakan untuk resource-specific authorization

## Security Architecture

- JWT access token + refresh token
- Active session enforcement
- Remember-me aware session lifecycle
- Password policy dan password history
- Account lockout dan rate limiting
- CAPTCHA untuk login dan forgot password
- 2FA dengan Google Authenticator compatible TOTP
- CSRF/XSS/secure header hardening pada boundary aplikasi

## Asynchronous and Scheduled Processing

- Queue worker memproses notification dan workload async
- Scheduler menjalankan command terjadwal seperti snapshot workforce
- Notifications dapat diarahkan ke email, in-app, dan connector-ready channel

## Frontend Architecture

Frontend menggunakan feature-based organization:

- `src/app`
  - App providers dan router
- `src/features`
  - Satu folder per domain workspace
- `src/components/ui`
  - Reusable UI primitive
- `src/lib`
  - HTTP client, env mapping, utility
- `src/types`
  - Shared TypeScript types

## Runtime Modes

### Native Development

- Backend dan frontend dijalankan terpisah
- SQLite atau PostgreSQL lokal dapat dipakai

### Docker Compose Development

- `laravel`, `nginx`, `postgres`, `redis`, `mailpit`, `queue`, `scheduler`
- frontend tersedia via profile opsional

## Related Documents

- [Folder Structure](folder-structure.md)
- [Flowchart](flowchart.md)
- [API Documentation](../api/README.md)
- [ERD](../database/erd.md)
