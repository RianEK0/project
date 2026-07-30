# Inventory Foundation

Sprint 3A memperkenalkan fondasi inventory yang menggunakan `InventoryItem`, `InventoryBalance`, dan `InventoryLedgerEntry` sebagai inti.

## Core Layers

- `InventoryItem`: konfigurasi inventory per variant.
- `InventoryBalance`: read model cepat untuk query stok.
- `InventoryLedgerEntry`: append-only ledger untuk jejak mutasi penting.
- `InventoryLot`: identitas batch untuk item lot-tracked.
- `InventorySerial`: identitas unit untuk item serial-tracked.
- `InventoryReservation`: alokasi stok sebelum fulfillment.
- `InventoryOpeningBalance`: sumber inisialisasi stok awal.

## Inventory Sources in Sprint 3A

- opening balance posting,
- reservation create,
- reservation release,
- reservation expire,
- alert and diagnostic read model checks.

## Explicit Non-Goals

- transfer workflow penuh,
- receipt/issue final,
- valuation final,
- FEFO/FIFO/LIFO production workflow,
- physical stock count.
