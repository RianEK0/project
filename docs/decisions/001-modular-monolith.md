# ADR 001: Modular Monolith

## Status

Accepted

## Decision

Sprint 1 menggunakan modular monolith, bukan microservices.

## Rationale

- Mengurangi overhead operasional.
- Mempercepat delivery auth, tenant, dan RBAC.
- Memudahkan testing dan local development.
- Tetap bisa dipisah per bounded context di sprint berikutnya.
