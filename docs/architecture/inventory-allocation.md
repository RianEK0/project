# Inventory Allocation

Sprint 3B memisahkan `InventoryReservation` dan `InventoryAllocation`.

## Decision

- `InventoryReservation` tetap menjadi komitmen bisnis,
- `InventoryAllocation` menyimpan lokasi, lot, serial, dan quantity spesifik yang akan diambil operator,
- satu reservation dapat memiliki beberapa allocation breakdown.
