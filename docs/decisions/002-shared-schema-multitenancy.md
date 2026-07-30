# ADR 002: Shared Schema Multi-Tenancy

## Status

Accepted

## Decision

Tenant data menggunakan shared database dan shared schema, dengan `organizationId` sebagai tenant boundary utama.

## Rationale

- Lebih sederhana untuk Sprint 1.
- Cocok untuk SaaS portfolio dan MVP enterprise.
- Biaya operasional lebih rendah daripada schema-per-tenant atau database-per-tenant.
