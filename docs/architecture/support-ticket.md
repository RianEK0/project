# Support Ticket Foundation

Fondasi support ticket NovaERP menyiapkan intake, triage, status workflow, dan visibility pelanggan untuk kebutuhan helpdesk enterprise.

## Scope

- ticket creation dari portal,
- kategori issue untuk booking, order, invoice, payment, technical, document, dan general support,
- priority, channel, dan SLA starter,
- status workflow untuk acknowledgment, in-progress, waiting for customer, resolved, dan closed,
- koordinasi customer success dan support agent.

## Workflow

1. Customer membuat ticket dari portal berdasarkan transaksi atau kebutuhan umum.
2. Ticket masuk dengan channel, kategori, prioritas, dan target SLA awal.
3. Customer success atau support agent melakukan acknowledgment.
4. Ticket dapat dipindahkan ke `IN_PROGRESS` atau `WAITING_FOR_CUSTOMER`.
5. Issue yang selesai dipindahkan ke `RESOLVED`, lalu dapat ditutup menjadi `CLOSED`.

## Roles

- `CUSTOMER_PORTAL_USER` membuat dan memantau ticket miliknya.
- `CUSTOMER_SUCCESS_MANAGER` memonitor SLA, backlog, dan escalation.
- `SUPPORT_AGENT` menangani respon, investigasi, dan closure operasional.

## Non-Goals

- omnichannel bot automation penuh,
- asset/CMDB management,
- ITIL change management lengkap,
- billing dispute automation penuh.
