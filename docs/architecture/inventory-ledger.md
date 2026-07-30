# Inventory Ledger

Sprint 3A menyiapkan `InventoryLedgerEntry` sebagai append-only journal untuk mutation inventory awal.

## Why Ledger Exists

- melacak perubahan stok yang diposting,
- menjaga hubungan audit antara sumber transaksi dan balance,
- menyiapkan fondasi stock movement Sprint 3B.

## Entry Types

- `OPENING_BALANCE`
- `RESERVATION_CREATED`
- `RESERVATION_RELEASED`
- `RESERVATION_FULFILLED`
- `MANUAL_INITIALIZATION`
- `SYSTEM_CORRECTION`

## Rules

- Ledger tidak diupdate atau dihapus pada flow normal.
- `idempotencyKey` unik per organization bila diisi.
- `quantityDelta` dan `reservedDelta` dapat positif atau negatif.
- Balance dan ledger ditulis dalam satu transaction.
