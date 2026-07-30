# Pricing Engine

Pricing NovaERP Sprint 2 bersifat server-side, deterministik, dan menggunakan decimal.

## Inputs

- service
- schedule
- quantity
- participant count
- customer group
- location
- resource
- promotion code
- tax config
- fee config

## Calculation Order

1. Ambil `basePrice` dari service.
2. Terapkan price rules berdasarkan `priority` ascending.
3. Terapkan promotion yang valid.
4. Batasi total discount agar tidak negatif.
5. Hitung fee.
6. Hitung tax.
7. Bentuk snapshot final.

## Output

- `baseAmount`
- `appliedRules`
- `discountLines`
- `feeLines`
- `taxLines`
- `subtotal`
- `discountTotal`
- `feeTotal`
- `taxTotal`
- `grandTotal`
- `currency`
- `warnings`

## Principles

- semua uang memakai decimal
- frontend tidak menentukan total akhir
- hasil disimpan sebagai snapshot di booking dan invoice
