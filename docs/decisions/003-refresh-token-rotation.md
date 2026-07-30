# ADR 003: Refresh Token Rotation

## Status

Accepted

## Decision

Refresh token harus:

- di-hash di database,
- dirotasi pada setiap refresh,
- memiliki family tracking,
- mendeteksi reuse dan merevoke family terkait.

## Rationale

- Mengurangi dampak kebocoran refresh token.
- Memberi jejak sesi yang lebih aman.
- Mendukung logout per perangkat dan logout semua perangkat.
