# Product Variant Model

Sprint 3A menetapkan `ProductVariant` sebagai stock unit utama agar inventory, barcode, lot, serial, dan reservation selalu beroperasi pada grain yang stabil.

## Variant Responsibilities

- menyimpan `SKU`,
- menyimpan harga default dan biaya default turunan dari product,
- menjadi sumber utama barcode,
- menjadi unit utama untuk `InventoryItem`, `InventoryBalance`, `InventoryLot`, `InventorySerial`, dan `InventoryReservation`.

## Variant Shapes

- `default variant`: dipakai untuk product tanpa variasi eksplisit,
- `generated variant`: dihasilkan dari kombinasi attribute values,
- `bundle component variant`: dipakai sebagai komponen product bundle.

## Combination Strategy

- Variant generator menerima attribute values yang sudah tervalidasi tenant-safe.
- Kombinasi dibatasi agar tidak terjadi combinatorial explosion.
- Preview dibuat sebelum persist.
- Kombinasi harus unik per product.

## SKU Strategy

- SKU boleh manual atau otomatis.
- Pola default memakai token seperti `{PRODUCT_CODE}-{ATTRIBUTE_CODE}`.
- Konflik tidak diselesaikan dengan `count + 1`.
- Audit log wajib mencatat perubahan SKU.
