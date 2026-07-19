# Architecture Overview

## Goals

- Modular dan scalable untuk domain HRIS yang terus bertambah
- Clean Architecture ringan yang tetap idiomatik terhadap Laravel 12
- Production-ready dengan security, background jobs, observability-friendly flows, dan dokumentasi API

## Backend Layering

- `app/Http`
  - Entry point framework: controllers, requests, resources, middleware
- `src/Modules`
  - `AccessControl`
    - `Application`: use case DTO dan auth service
    - `Domain`: repository contracts
    - `Infrastructure`: Eloquent model dan repository implementation
  - `Workforce`
    - `Application`: employee DTO dan service
    - `Domain`: repository contracts
    - `Infrastructure`: model dan repository Eloquent
  - `Organization`
    - `Application`: team DTO dan service
    - `Domain`: repository contracts
    - `Infrastructure`: team model dan repository Eloquent
  - `Leave`
    - `Application`: leave request DTO dan approval workflow service
    - `Domain`: repository contracts
    - `Infrastructure`: leave type, leave request, leave approval model dan repository
  - `Governance`
    - `Application`: audit logging service
    - `Domain`: repository contracts
    - `Infrastructure`: audit log model dan repository
- `app/Providers`
  - Binding interface ke implementation, policy registration, event registration

## Frontend Layering

- `src/app`
  - Router, app providers, shell layout
- `src/features`
  - Feature-scoped auth, dashboard, workforce, organization, leave, governance
- `src/components/ui`
  - Reusable shadcn-style primitives
- `src/lib`
  - Axios client, env mapping, utility helper

## Security Model

- JWT authentication untuk REST API
- Laravel Policy untuk resource authorization
- Permission middleware untuk route-level guard
- RBAC custom tables: `roles`, `permissions`, `role_user`, `permission_role`
- Approval boundary dijaga oleh policy + permission `leave-requests.approve`
- Audit trail dapat diakses hanya oleh role yang memiliki `audit.view`

## Async and Automation

- Event: `EmployeeCreated`
- Listener queued: `QueueEmployeeProvisionedNotification`
- Notification: mail + database for administrators
- Event: `LeaveRequestSubmitted`
- Listener queued: `QueueLeaveApprovalNotification`
- Notification: database + mail pipeline untuk approver berikutnya
- Scheduler command: `hris:daily-workforce-snapshot`

## Folder Principles

- Framework concerns tetap berada di `app`
- Domain and application logic ditempatkan di `src/Modules`
- Contracts dipisahkan dari implementation untuk menjaga testability dan dependency direction
- DTO digunakan untuk menjaga boundary antar layer tetap tegas
- Modul baru harus masuk ke `src/Modules/<Domain>` dan tidak menaruh business rule di controller
