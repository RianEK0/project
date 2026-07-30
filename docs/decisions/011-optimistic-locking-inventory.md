# ADR 011: Optimistic Locking Inventory

## Status

Accepted

## Decision

Mutation `InventoryBalance` menggunakan optimistic locking melalui `version` dan atomic update condition.

## Rationale

- lebih ringan untuk mayoritas contention normal,
- tetap aman untuk reservation dan opening balance,
- dapat digabung dengan retry terbatas.
