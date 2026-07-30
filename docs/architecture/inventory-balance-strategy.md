# Inventory Balance Strategy

Sprint 3A memakai `InventoryBalance` sebagai read model cepat yang diperbarui server-side dalam transaction yang sama dengan ledger.

## Grain

Satu row balance direkomendasikan per kombinasi:

- `organizationId`
- `warehouseId`
- `storageLocationId`
- `productVariantId`
- `lotId nullable`

## Quantity Columns

- `onHandQuantity`
- `reservedQuantity`
- `availableQuantity`
- `damagedQuantity`
- `quarantineQuantity`
- `incomingQuantity`
- `outgoingQuantity`

## Rules

- Semua quantity memakai `Decimal`.
- `availableQuantity` dihitung di server, bukan dipercaya dari client.
- `version` dipakai untuk optimistic locking.
- Direct stock editing endpoint tidak diizinkan.

## Tradeoff

Kolom quantity mempercepat dashboard dan availability query, sementara ledger tetap menjaga audit trail append-only.
