# ADR 008: Inventory Balance and Ledger

## Status

Accepted

## Decision

NovaERP memakai kombinasi `InventoryBalance` sebagai read model cepat dan `InventoryLedgerEntry` sebagai append-only journal.

## Rationale

- dashboard dan availability perlu query cepat,
- audit trail mutation tetap dibutuhkan,
- model ini lebih siap untuk Sprint 3B dibanding menyimpan stock tunggal di variant.
