# ADR 020: Shared Goods Receipt Between Procurement And Warehouse

## Status

Accepted

## Decision

Purchase receipt tidak membangun engine receipt fisik baru. Procurement memakai `GoodsReceiptsModule` yang sudah menjadi fondasi warehouse inbound.

## Consequences

- tidak ada duplikasi receipt lifecycle,
- PO dan procurement cukup mengirim orchestration context,
- stok tetap bergerak lewat workflow warehouse yang sama.
