# Authorization

Authorization NovaERP Sprint 1 berbasis permission, bukan sekadar nama role.

## Model

- `Permission`: katalog kemampuan sistem
- `Role`: kumpulan permission
- `MembershipRole`: assignment role ke membership
- `Membership`: representasi user di organization

## Permission Check

```mermaid
sequenceDiagram
  participant C as Client
  participant A as API
  participant R as Redis
  participant D as PostgreSQL

  C->>A: Request with access token
  A->>R: Get membership permissions
  alt cache hit
    R-->>A: permission set
  else cache miss
    A->>D: load membership roles + permissions
    A->>R: cache permission set
  end
  A-->>C: allow or deny request
```

## Notes

- Super admin bypass hanya berlaku pada route yang memang diizinkan.
- Perubahan role dan permission wajib menginvalidasi cache.
- Permission guard menerima input seperti `organization:update` atau `membership:remove`.
