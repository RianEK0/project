# UOM and Conversion

Sprint 3A menggunakan `UnitOfMeasure` dan `UnitConversion` berbasis `Decimal` untuk seluruh quantity inventory.

## UOM Layers

- `system UOM`: shared, `organizationId = null`.
- `tenant UOM`: custom per organization.
- `stocking UOM`: unit utama penyimpanan variant.
- `purchase UOM`: unit untuk supplier relation.
- `sales UOM`: unit untuk transaksi komersial berikutnya.

## Conversion Rules

- `fromUomId` dan `toUomId` harus berbeda.
- Dimensi harus kompatibel.
- `multiplier` dan `divisor` wajib lebih besar dari nol.
- Konversi tidak boleh ambigu untuk pasangan unit yang sama.
- Pembulatan mengikuti `roundingMode` dan precision target.

## Operational Principle

- Semua mutation inventory dikonversi dulu ke stocking UOM.
- Availability dan reservation menghitung quantity final di stocking UOM.
- Client tidak boleh menghitung available stock sendiri.
