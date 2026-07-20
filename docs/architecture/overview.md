# Architecture Overview

Enterprise HRIS uses a monorepo approach with a clear separation between the backend API, frontend dashboard, container tooling, and documentation.

## Architectural Goals

- Modular for an expanding HRIS domain surface
- Easy to test through the separation of services, contracts, requests, resources, and policies
- Secure for enterprise operations through modern auth, RBAC, audit logs, queues, and schedulers
- Easy to deploy both locally and in containers

## High-Level Topology

- The React frontend consumes the Laravel REST API over JSON HTTP
- The Laravel API manages authentication, authorization, business workflows, persistence, and auditing
- PostgreSQL is the primary relational database
- Redis is used for cache, queues, and runtime support state
- Mailpit is used for mail testing in development environments
- Queue workers and the scheduler run as separate services in the Docker stack

## Backend Architecture

The backend follows a modular Laravel pattern with a domain-oriented structure:

- `app/Http`
  - Controller, request validation, API resource, middleware
- `app/Policies`
  - Authorization policy per resource
- `app/Providers`
  - Binding service container, policy, event registration
- `app/Notifications`, `app/Events`, `app/Listeners`
  - Cross-cutting asynchronous behavior
- `src/Modules`
  - Core domain business logic
- `src/Shared`
  - Shared DTO base classes, response helpers, pagination helpers, and collection query helpers

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

Each module generally follows this structure:

- `Application`
  - Use-case services and DTOs
- `Domain`
  - Contracts or interface dependencies
- `Infrastructure`
  - Eloquent models, repository implementations, and persistence details

Dependency principles:

- Controllers do not know about persistence details
- Services use repository contracts or relevant models
- Shared helpers are used for response envelopes, pagination, filtering, sorting, and search

## API Design Principles

- All core features are exposed through the REST API
- Response formats use a JSON envelope
- Pagination is available on collection endpoints
- Filtering, sorting, and search are applied consistently
- Permission middleware is enforced at the route level
- Policies are used for resource-specific authorization

## Security Architecture

- JWT access token + refresh token
- Active session enforcement
- Remember-me aware session lifecycle
- Password policies and password history
- Account lockout and rate limiting
- CAPTCHA for login and forgot password
- 2FA with Google Authenticator-compatible TOTP
- CSRF, XSS, and secure-header hardening at the application boundary

## Asynchronous and Scheduled Processing

- Queue workers process notifications and asynchronous workloads
- The scheduler runs scheduled commands such as workforce snapshots
- Notifications can be routed to email, in-app delivery, and connector-ready channels

## Frontend Architecture

The frontend uses a feature-based organization:

- `src/app`
  - App providers and router
- `src/features`
  - One folder per domain workspace
- `src/components/ui`
  - Reusable UI primitive
- `src/lib`
  - HTTP client, env mapping, utility
- `src/types`
  - Shared TypeScript types

## Runtime Modes

### Native Development

- Backend and frontend run separately
- Local SQLite or PostgreSQL can be used

### Docker Compose Development

- `laravel`, `nginx`, `postgres`, `redis`, `mailpit`, `queue`, `scheduler`
- the frontend is available through an optional profile

## Related Documents

- [Folder Structure](folder-structure.md)
- [Flowchart](flowchart.md)
- [API Documentation](../api/README.md)
- [ERD](../database/erd.md)
