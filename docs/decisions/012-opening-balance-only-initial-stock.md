# ADR 012: Opening Balance as Initial Stock Entry

## Status

Accepted

## Decision

Sprint 3A hanya mengizinkan inisialisasi stok awal melalui `InventoryOpeningBalance`, bukan direct stock edit endpoint.

## Rationale

- menjaga audit trail,
- memaksa ledger selalu terbentuk,
- mencegah inkonsistensi ketika procurement dan stock movement penuh belum tersedia.
