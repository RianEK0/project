# Inventory Alerts

Sprint 3A menambahkan alert engine dasar untuk low stock, out of stock, expiring items, dan data inconsistency.

## Alert Sources

- reorder rule evaluation,
- expiration checker,
- diagnostic checker,
- negative or blocked stock anomaly detection.

## Lifecycle

- `OPEN`
- `ACKNOWLEDGED`
- `RESOLVED`
- `DISMISSED`

## Idempotency Rule

Open alert yang setara tidak boleh dibuat berulang kali pada entity yang sama tanpa perubahan kondisi.
