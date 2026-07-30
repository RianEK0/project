# Customer Portal Workflow Foundation

Fondasi Customer Portal NovaERP menyediakan pengalaman self-service yang berdiri di atas booking, sales order, invoice, payment, dan support workflow yang sudah ada.

## Scope

- portal dashboard,
- booking visibility dan self-service action starter,
- order, invoice, dan payment visibility,
- download center untuk invoice, voucher, statement, dan proof,
- profile self-service,
- notification center dan tracking timeline,
- support center dan escalation entrypoint.

## Workflow

1. Customer login ke area `/portal` dengan identitas tenant yang sesuai.
2. Dashboard portal menampilkan ringkasan booking, order, invoice, payment, ticket, dan notification.
3. Customer membuka detail booking, order, invoice, atau payment tanpa harus masuk ke dashboard internal.
4. Customer mengunduh dokumen seperti invoice PDF, booking voucher, atau proof yang tersedia.
5. Bila ada isu, customer membuat support ticket atau menindaklanjuti ticket yang sedang berjalan.
6. Tracking timeline menyatukan milestone booking, fulfillment, payment, dan support agar customer mendapat konteks progres yang konsisten.

## Integration Boundaries

- `BookingsModule`, `SalesOrdersModule`, `InvoicesModule`, dan `PaymentsModule` tetap menjadi sumber data transaksi utama.
- `SupportTicketsModule` menjadi bounded context support yang dipakai portal dan tim customer success.
- `PortalNotificationsModule`, `PortalTrackingModule`, dan `PortalDownloadsModule` berperan sebagai komposer customer-facing, bukan sebagai source of truth transaksi.

## Non-Goals

- full B2C storefront,
- public anonymous checkout,
- live chat production integration,
- automatic payment gateway settlement,
- mobile app parity penuh pada sprint ini.
