# ADR 013: Generic Inventory Movement Document

## Status

Accepted

## Decision

Sprint 3B memakai `InventoryMovement` sebagai dokumen generik append-only untuk semua mutasi stok penting.

## Rationale

- menyatukan ledger reference,
- mempermudah reversal dan audit,
- menghindari logic stok tersebar di banyak dokumen operasional.
