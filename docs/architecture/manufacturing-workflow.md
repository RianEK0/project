# Manufacturing / Production Operations Workflow Foundation

Fondasi Manufacturing / Production Operations NovaERP menyiapkan workspace internal untuk struktur produk, planning, eksekusi shop floor, kualitas, dan kapasitas tanpa langsung memecah sistem ke MES, APS, atau CMMS terpisah.

## Scope

- bill of material dan routing foundation,
- production dan work order starter,
- machine master dan maintenance starter,
- quality control dan scrap tracking starter,
- production planning, MRP, dan capacity planning foundation.

## Workflow

1. Bill of material dan routing mendefinisikan struktur produk serta urutan operasi.
2. Production planning menyusun horizon dan window release.
3. MRP membaca shortage material dan memberi sinyal replenishment.
4. Capacity planning memeriksa beban work center terhadap jam tersedia.
5. Production order dan work order dirilis ke shop floor.
6. Machine dan maintenance menjaga kesiapan aset produksi.
7. Quality control dan scrap memberi umpan balik terhadap hasil produksi dan loss.

## Integration Boundaries

- `ProductsModule`, `InventoryModule`, `SuppliersModule`, dan `WarehousesModule` tetap menjadi sumber master item, stok, dan replenishment fisik.
- Procurement tetap menjadi jalur komersial pengadaan; MRP hanya menghasilkan sinyal dan rekomendasi kebutuhan.
- Finance tidak digandakan di manufacturing; scrap, variance, dan WIP accounting final tetap ditunda ke bounded context `Finance`.
- HR tetap menjadi sumber employee, shift, dan organization structure untuk operator atau planner.

## Non-Goals

- real-time machine telemetry,
- OEE dashboard production-grade,
- detailed shop-floor terminal execution,
- full CMMS feature parity,
- WIP costing dan standard cost variance accounting penuh.
