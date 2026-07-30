# Document Sequence

Sprint 2 menggunakan tabel `DocumentSequence` untuk nomor dokumen yang aman dari race condition.

## Supported Types

- `BOOKING`
- `INVOICE`
- `PAYMENT`
- `CUSTOMER`

## Strategy

- satu sequence per `organizationId + documentType`
- update sequence dilakukan di transaction
- format dasar:
  - `BKG-202607-000001`
  - `INV-202607-000001`

## Why Not Count + 1

Strategi `count + 1` rentan race condition ketika dua transaksi berjalan bersamaan.
