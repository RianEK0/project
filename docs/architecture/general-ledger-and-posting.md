# General Ledger and Posting Foundation

Fondasi ini mengatur bagaimana journal yang seimbang dapat diposting ke general ledger secara terkendali.

## Scope

- journal status starter,
- balanced-entry validation,
- posting batch starter,
- voucher orchestration,
- general ledger summary starter,
- reversal-ready transition matrix.

## Design Notes

- Journal harus seimbang sebelum status `POSTED`.
- Posting batch digunakan untuk mengelompokkan journal atau voucher yang siap diposting.
- General ledger pada sprint ini berperan sebagai reporting foundation dan posting destination, bukan full reconciliation engine.
- Voucher diposisikan sebagai dokumen finance control untuk bank, cash, adjustment, dan manual accrual/prepayment starter.

## Non-Goals

- posting queue distributed processing,
- recurring journal automation penuh,
- statutory close workflow end-to-end,
- external accounting package synchronization.
