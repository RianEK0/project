# CRM and Sales Workflow Foundation

Fondasi CRM/Sales NovaERP menutup alur dari lead pertama sampai deal menang.

## Scope

- lead capture dari website, phone, email, WhatsApp, referral, atau manual,
- opportunity dan deal progression,
- activity log untuk call, email, WhatsApp, meeting, task, reminder, dan follow up,
- sales quotation,
- funnel, pipeline, customer timeline, dan sales dashboard starter.

## Workflow

1. Lead dibuat dari channel akuisisi.
2. Sales rep melakukan contact dan qualification.
3. Lead yang layak dikonversi menjadi opportunity.
4. Opportunity bergerak ke proposal, quotation, dan negotiation.
5. Deal ditandai won atau lost.
6. Aktivitas komunikasi dan follow up direkam ke customer timeline.
7. Dashboard membaca conversion funnel dan weighted pipeline.

## Integration Boundaries

- `CustomersModule` tetap menjadi customer master utama.
- `InvoicesModule` dan accounting belum menjadi bagian dari closing sales otomatis pada tahap ini.
- `NotificationsModule` dapat dipakai kemudian untuk omnichannel send engine.
- `BookingsModule` dan `ProductsModule` dapat menjadi sumber quotation line item di sprint berikutnya.

## Non-Goals

- email gateway production,
- WhatsApp BSP integration,
- revenue recognition,
- automatic invoice posting,
- commission engine,
- AI-generated outreach automation penuh.
