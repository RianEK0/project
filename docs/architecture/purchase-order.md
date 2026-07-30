# Purchase Order Foundation

Purchase order adalah komitmen pembelian resmi ke supplier.

## Covered In Sprint 3C

- standard PO,
- blanket order release foundation,
- purchase contract release foundation,
- partial receive dan backorder awareness,
- purchase receipt handoff ke goods receipt,
- invoice preparation readiness.

## Status

- `DRAFT`
- `PENDING_APPROVAL`
- `APPROVED`
- `SENT`
- `PARTIALLY_RECEIVED`
- `RECEIVED`
- `PARTIALLY_INVOICED`
- `INVOICED`
- `CLOSED`
- `REJECTED`
- `CANCELLED`

## Rules

- PO tidak boleh langsung `INVOICED` tanpa minimal partial receipt,
- PO `SENT` dapat bergerak ke `PARTIALLY_RECEIVED` atau `RECEIVED`,
- backorder disajikan sebagai sisa kuantitas pada partial receipt,
- accounting final tetap di Sprint 5.
