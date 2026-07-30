# Inventory Concurrency

Sprint 3A memakai kombinasi transaction PostgreSQL, optimistic locking, dan atomic update condition untuk mutation stok.

## Strategy

- baca balance current,
- validasi invariant,
- update row dengan `version` atau kondisi `available >= requested`,
- bila update count nol, kembalikan conflict dan retry terbatas bila aman,
- commit reservation atau opening balance dalam transaction yang sama.

## Why Not Client-Side Trust

- availability berubah cepat,
- reserved stock tidak boleh dihitung di browser,
- tenant-safe mutation hanya bisa dijamin server-side.

## Failure Modes

- `INVENTORY_CONCURRENCY_CONFLICT`
- `INVENTORY_INSUFFICIENT_STOCK`
- `INVENTORY_INVARIANT_VIOLATION`
