# Order-to-Cash Workflow Foundation

Fondasi Sales / Order-to-Cash NovaERP melanjutkan quotation CRM menjadi order, fulfillment, invoice, return, dan credit handling.

## Scope

- sales order,
- sales quotation handoff dari CRM,
- sales invoice orchestration,
- delivery order dan shipment,
- sales return dan credit note,
- discount engine dan tax engine starter,
- price list,
- customer credit dan installment,
- sales analytics starter.

## Workflow

1. Quotation CRM atau direct order menjadi sales order.
2. Sales order masuk approval atau release flow bila diperlukan.
3. Order diteruskan ke delivery order dan shipment.
4. Warehouse menjalankan pick, pack, dan dispatch sebagai engine fulfillment fisik.
5. Sales invoice disiapkan atau diterbitkan dari order/delivery completion.
6. Return yang valid dapat memicu credit note atau refund handling.
7. Customer credit, installment, discount, dan tax menjadi kontrol komersial sebelum posting accounting final.

## Integration Boundaries

- `SalesQuotationsModule` tetap menjadi sumber quotation komersial utama.
- `GoodsIssuesModule`, `PackingModule`, dan `DispatchModule` tetap menjadi engine fulfillment fisik.
- `InvoicesModule` dan `PaymentsModule` tetap menjadi engine invoice dan payment existing.
- `PricingModule` tetap menjadi kalkulator umum, sedangkan discount dan tax engine pada slice ini menjadi aturan sales-specific.

## Non-Goals

- full general ledger posting,
- automatic revenue recognition,
- e-faktur production integration,
- courier carrier integration penuh,
- accounts receivable reconciliation automation penuh.
