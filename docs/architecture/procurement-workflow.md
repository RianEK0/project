# Procurement Workflow Foundation

Sprint 3C menambahkan fondasi procurement sebelum accounting Sprint 5.

## Scope

- purchase request dari employee atau replenishment trigger,
- approval flow procurement,
- RFQ dan supplier quotation,
- vendor comparison,
- purchase order,
- blanket order dan purchase contract foundation,
- purchase receipt orchestration yang terhubung ke goods receipt,
- purchase invoice preparation,
- vendor performance insights,
- purchase analytics starter dashboard.

## Workflow

1. Employee atau system membuat purchase request.
2. Request masuk approval lane.
3. Request yang lolos approval masuk sourcing atau RFQ.
4. Supplier quotation diterima dan dibandingkan.
5. Buyer atau procurement manager memutuskan vendor pemenang.
6. Purchase order dibuat dan dikirim.
7. Purchase receipt menggunakan goods receipt foundation yang sudah ada.
8. Invoice preparation baru disiapkan di procurement.
9. Accounting posting final ditunda ke Sprint 5.

## Integration Boundaries

- `SuppliersModule` tetap menjadi vendor master utama.
- `GoodsReceiptsModule` tetap menjadi engine receipt fisik.
- `InvoicesModule` tetap menjadi modul invoice existing; procurement hanya menyiapkan data awal.
- `Inventory` dan `Warehouse Operations` menangani stok sesudah receipt berjalan.

## Non-Goals

- full accounts payable,
- automatic journal entries,
- tax accounting,
- payment execution vendor,
- three-way match final accounting,
- budget engine penuh.
