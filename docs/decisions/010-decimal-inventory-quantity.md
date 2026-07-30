# ADR 010: Decimal Inventory Quantity

## Status

Accepted

## Decision

Seluruh quantity inventory menggunakan `Decimal`, bukan floating point biasa.

## Rationale

- menghindari error pembulatan,
- konsisten dengan UOM precision,
- aman untuk quantity pecahan dan conversion.
