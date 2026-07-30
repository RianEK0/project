# Multi-Tenancy

NovaERP Sprint 1 menggunakan shared database dan shared schema.

## Rules

- Satu user dapat bergabung ke banyak organization.
- Membership menjadi sumber kebenaran organization context.
- `organizationId` dari client tidak boleh langsung dipercaya.
- Semua query tenant harus memfilter berdasarkan tenant context tervalidasi.

## Invitation Sequence

```mermaid
sequenceDiagram
  participant O as Owner
  participant W as Web
  participant A as API
  participant D as PostgreSQL
  participant M as Mailpit

  O->>W: invite member
  W->>A: POST invitation
  A->>D: store invitation token hash
  A->>M: send invitation email
  M-->>O: email preview available
```

## Boundaries

- `Organization`
- `Workspace`
- `Membership`
- `Role`
- `Invitation`
- `AuditLog`
- `OrganizationSetting`
