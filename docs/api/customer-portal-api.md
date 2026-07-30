# Customer Portal API Foundation

Endpoint portal customer disediakan pada `/api/v1` sebagai customer-facing composition layer.

## Endpoints

- `GET /portal-dashboard`
- `GET /portal-bookings`
- `GET /portal-orders`
- `GET /portal-invoices`
- `GET /portal-payments`
- `GET /portal-profile`
- `GET /portal-support`
- `GET /support-tickets`
- `GET /support-tickets/metadata`
- `GET /portal-notifications`
- `GET /portal-tracking`
- `GET /portal-tracking/timeline`
- `GET /portal-downloads`

## Response Shape

- Semua endpoint tetap mengikuti envelope API standar NovaERP.
- Endpoint foundation saat ini mengembalikan metadata, starter cards, enum state, dan sample timeline untuk membantu frontend portal dibangun lebih cepat.

## Boundaries

- Portal tidak membuat duplikasi transaksi inti.
- Booking, order, invoice, dan payment tetap berasal dari module transaksi masing-masing.
- Support, notification, tracking, dan downloads bertindak sebagai orchestration/customer experience layer.
