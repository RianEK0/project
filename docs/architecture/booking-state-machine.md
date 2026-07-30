# Booking State Machine

Booking NovaERP Sprint 2 tidak boleh berubah status secara bebas.

```mermaid
stateDiagram-v2
  [*] --> DRAFT
  DRAFT --> PENDING
  PENDING --> PENDING_APPROVAL
  PENDING_APPROVAL --> CONFIRMED
  CONFIRMED --> PARTIALLY_PAID
  PARTIALLY_PAID --> PAID
  PAID --> CHECKED_IN
  CHECKED_IN --> IN_PROGRESS
  IN_PROGRESS --> COMPLETED

  PENDING --> CANCELLED
  PENDING_APPROVAL --> CANCELLED
  CONFIRMED --> CANCELLED
  CONFIRMED --> NO_SHOW
  PAID --> REFUNDED
```

## Required Side Effects

Setiap perubahan status harus:

- divalidasi oleh state transition service,
- dicatat di `BookingStatusHistory`,
- dicatat di `AuditLog`,
- menerbitkan domain event internal,
- memperbarui data finansial bila relevan.
