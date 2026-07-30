# Authentication

Sprint 1 menggunakan kombinasi access token dan refresh token rotation.

## Principles

- Access token berumur pendek.
- Refresh token disimpan dalam cookie `HttpOnly`.
- Hash refresh token disimpan di database.
- Reuse detection akan merevoke seluruh token family.
- Password di-hash dengan Argon2id.

## Login Sequence

```mermaid
sequenceDiagram
  participant U as User
  participant W as Web
  participant A as API
  participant D as PostgreSQL

  U->>W: submit email + password
  W->>A: POST /api/v1/auth/login
  A->>D: verify user + password hash
  A->>D: persist refresh token hash
  A-->>W: access token + refresh cookie
  W-->>U: redirect to dashboard
```

## Refresh Token Sequence

```mermaid
sequenceDiagram
  participant W as Web
  participant A as API
  participant D as PostgreSQL

  W->>A: POST /api/v1/auth/refresh
  A->>D: verify refresh token family
  A->>D: revoke previous token and create replacement
  A-->>W: new access token + rotated refresh cookie
```
