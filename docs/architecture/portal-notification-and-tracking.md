# Portal Notification and Tracking Foundation

Fondasi ini menyatukan komunikasi customer-facing melalui notification center dan tracking timeline.

## Scope

- in-app notification starter,
- channel metadata untuk email, WhatsApp, SMS, dan in-app,
- read/archive state customer,
- timeline tracking untuk booking, order, invoice, payment, shipment, dan support ticket,
- exception flag untuk milestone yang membutuhkan perhatian customer.

## Design Notes

- Notification center menyimpan status baca customer tanpa menggandakan isi source transaction.
- Tracking timeline bersifat komposisi lintas domain dan menampilkan milestone yang paling relevan untuk customer.
- Event status dibatasi menjadi `SCHEDULED`, `ACTIVE`, `COMPLETED`, dan `EXCEPTION` agar mudah dipresentasikan di portal.

## Non-Goals

- campaign marketing automation,
- push notification mobile production integration,
- webhook delivery guarantee penuh,
- event streaming analytics real-time penuh.
