# Inventory Reservation

Reservation Sprint 3A mengurangi `availableQuantity` tanpa menyelesaikan fulfillment akhir.

## Reservation Sources

- booking,
- rental,
- manual internal allocation,
- future sales order placeholder.

## Reservation Flow

1. Validasi tenant dan permission.
2. Validasi product, variant, warehouse, location, lot, atau serial bila ada.
3. Konversi quantity ke stocking UOM.
4. Hitung availability final.
5. Lock dan update balance secara atomik.
6. Buat reservation.
7. Tulis ledger.
8. Audit log.

## Important Guarantees

- serial reservation selalu quantity `1`,
- reservation tidak boleh melebihi available stock kecuali backorder diizinkan,
- source-based idempotency harus dijaga,
- expired reservation harus bisa dilepas otomatis.
