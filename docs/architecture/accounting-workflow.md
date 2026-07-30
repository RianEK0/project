# Finance / Accounting Workflow Foundation

Fondasi Finance / Accounting NovaERP menyiapkan struktur dasar untuk menampung jejak komersial, procurement, kas, aset, dan laporan keuangan sebelum automation posting production penuh.

## Scope

- chart of accounts,
- journal, posting, voucher, dan general ledger starter,
- bank dan cash foundation,
- budget dan cost center starter,
- fiscal year, currency, dan exchange rate management,
- fixed asset register dan depreciation starter,
- financial statement composition untuk balance sheet, profit loss, dan cash flow.

## Workflow

1. Transaksi operasional dari booking, procurement, sales, payment, dan adjustment menyediakan context untuk finance.
2. Journal entry dibentuk dan diseimbangkan pada level debit dan kredit.
3. Voucher atau posting batch menjadi kontrol sebelum journal masuk ke general ledger.
4. General ledger menyatukan hasil posting per account, period, cost center, dan currency.
5. Bank, cash, budget, asset, depreciation, dan exchange rate menjadi bounded contexts pendukung finance.
6. Financial statement menyusun ringkasan balance sheet, profit loss, dan cash flow dari struktur akun dan saldo ledger.

## Integration Boundaries

- `InvoicesModule`, `PaymentsModule`, `PurchaseInvoicePreparationModule`, dan `SalesInvoicesModule` tetap menjadi sumber transaksi bisnis.
- Fondasi finance pada sprint ini berfokus pada struktur akun, workflow posting, dan komposisi laporan, bukan full reconciliation production.
- Asset foundation dapat memakai `ProductType.ASSET` sebagai referensi inventaris, namun fixed asset register tetap diposisikan sebagai context finance tersendiri.

## Non-Goals

- production-grade tax filing,
- bank statement import automation,
- full AP/AR subledger reconciliation,
- closing checklist orchestration lengkap,
- statutory consolidation multi-entity penuh.
