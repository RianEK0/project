# Sprint 3A Migration Notes

Migration Sprint 3A menambahkan fondasi katalog produk dan inventory tanpa menghapus struktur Sprint 1 atau Sprint 2.

## Scope

- enum catalog dan inventory,
- master data produk,
- warehouse hierarchy,
- inventory item, balance, lot, serial, reservation,
- opening balance,
- ledger,
- alerts,
- import and export jobs,
- document sequence extension.

## Safety Notes

- migration tidak menghapus tabel sprint sebelumnya,
- foreign key memakai delete rule aman,
- stock mutation masa depan wajib melalui service layer,
- rollback perlu dilakukan melalui migration terpisah, bukan drop manual.
