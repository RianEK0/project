# ADR 006: Money Decimal Strategy

## Status

Accepted

## Decision

Semua nominal Sprint 2 disimpan sebagai decimal di database dan dihitung server-side.

## Rationale

- menghindari error floating point,
- menjaga konsistensi antara booking, invoice, dan payment,
- memudahkan audit finansial.
