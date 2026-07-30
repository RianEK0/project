# Goods Receipt

Goods receipt Sprint 3B mengizinkan inbound stock dari sumber manual, placeholder purchase order, transfer receipt, customer return placeholder, opening correction, dan source lain yang tervalidasi.

## Key Rules

- posting receipt membuat `InventoryMovement` bertipe `RECEIPT`,
- lot, serial, manufacture date, dan expiration harus lengkap sebelum posting untuk product terkait,
- hasil inspeksi menentukan apakah stock masuk `AVAILABLE`, `QUARANTINE`, atau `DAMAGED`,
- posting receipt juga dapat membuat `PutawayTask`.

```mermaid
sequenceDiagram
  participant U as User
  participant GR as GoodsReceiptService
  participant MV as InventoryMovementService
  participant BM as InventoryBalanceMutationService
  participant DB as PostgreSQL
  U->>GR: post receipt
  GR->>GR: validate tracking + inspection
  GR->>MV: create RECEIPT movement
  MV->>BM: increaseOnHand
  BM->>DB: lock balance + write ledger
  GR->>DB: create putaway task
```
