# ADR 007: Product Variant as Stock Unit

## Status

Accepted

## Decision

Sprint 3A menjadikan `ProductVariant` sebagai grain utama stok, barcode, reservation, lot, dan serial.

## Rationale

- satu variant setara satu SKU yang bisa dipindai,
- menghindari ambiguitas stok pada product multi-variant,
- membuka jalan untuk fulfillment dan valuation sprint lanjutan.
