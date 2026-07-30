# ERD Overview

Schema Prisma NovaERP dibagi ke domain berikut:

- Identity: user, session, refresh token, OTP, verification, 2FA.
- Access control: role, permission, role permission, member role.
- Tenant: organization, organization member, settings, API key, integration, integration connection, provider credential, dan metadata control plane tenant.
- Communication: notification, chat, file asset, file version, folder.
- Commerce: customer, vendor, booking, reservation, rental, marketplace, payment.
- Inventory: warehouse, bin, inventory item, movement, stock opname.
- CRM: lead, pipeline stage, deal, CRM activity.
- HR: department, position, employee, attendance, leave, payroll.
- Manufacturing: bill of material, routing, production order, work order, machine, quality, scrap.
- Finance: chart of account, journal, invoice, payment, expense, budget, tax.
- Delivery operations: vehicle, route, trip, fleet route, fuel log.
- Support & execution: support ticket, SLA, knowledge base, project, sprint, task.
- Intelligence & operations: AI chat session, AI search query, generated report, AI forecast, AI recommendation, AI OCR run, AI extraction job, AI contract review, AI meeting brief, approval flow, approval request, automation rule, webhook endpoint, cron job, AI prompt log, queue job, backup job, dashboard widget, dashboard snapshot, dashboard briefing, device session, offline sync batch, push subscription, PWA configuration, integration webhook, integration credential rotation.

## Modeling Principles

- Primary key menggunakan UUID string.
- Tabel utama memiliki `createdAt`, `updatedAt`, dan `deletedAt`.
- Mayoritas domain menyimpan `organizationId` untuk isolasi tenant.
- Reference master dipisahkan dari transaksi untuk menjaga normalisasi.
- Relasi dibuat secukupnya agar fase awal tetap mudah dikembangkan sambil menjaga foreign key inti.
- Capability platform enterprise seperti theme profile, marketplace extension, identity provider connection, dan compliance policy saat ini diposisikan sebagai metadata tenant/control-plane sampai tabel operasionalnya dipromosikan ke schema domain masing-masing.
