# Sprint 3B Migration Notes

Migration Sprint 3B menambahkan fondasi warehouse operations dan stock movement di atas Sprint 3A.

## Goals

- menambah dokumen movement operasional tanpa mengubah migration lama,
- memperluas `DocumentType` dan `InventoryLedgerEntryType`,
- mempertahankan compatibility terhadap database kosong maupun database yang sudah berisi data Sprint 3A.

## Rollback Plan

- rollback dilakukan dengan restore backup database,
- movement dan ledger baru tidak boleh dihapus manual bila sudah diposting,
- perubahan korektif sesudah deploy harus memakai migration lanjutan atau reversal data terkontrol.
