# Purchase Request

Purchase request adalah entry point procurement.

## Tujuan

- mengumpulkan kebutuhan pembelian dari employee atau replenishment,
- menjaga approval sebelum sourcing,
- menyediakan jejak audit dari kebutuhan sampai purchase order.

## Status

- `DRAFT`
- `SUBMITTED`
- `PENDING_APPROVAL`
- `APPROVED`
- `REJECTED`
- `SOURCING`
- `PARTIALLY_ORDERED`
- `ORDERED`
- `CANCELLED`

## Rules

- request tidak boleh langsung menjadi purchase order tanpa approval jika kebijakan mengharuskan,
- request yang sudah `ORDERED` bersifat immutable,
- request yang sudah `PARTIALLY_ORDERED` hanya boleh bergerak ke `ORDERED` atau `CANCELLED`,
- semua perubahan status harus tercatat di audit log.
