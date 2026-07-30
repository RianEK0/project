# Product Catalog Domain

Sprint 3A menambahkan fondasi katalog produk universal yang dapat dipakai lintas retail, rental, warehouse, hospitality, dan layanan operasional lain tanpa menyamakan `Product` dengan `Service` atau `Resource`.

## Core Concepts

- `Product`: master barang umum yang merepresentasikan entitas komersial atau stok.
- `ProductVariant`: unit spesifik yang menjadi grain utama SKU, barcode, dan stock.
- `ProductCategory`: hirarki kategori produk dengan batas depth yang terkendali.
- `Brand`: identitas merek yang terkait ke produk.
- `UnitOfMeasure`: unit kuantitas dan dimensi yang dapat dipakai lintas tenant atau custom per tenant.
- `Supplier`: pihak yang memasok produk atau variant.
- `ProductBundle`: komposisi produk yang availability-nya diturunkan dari component variant.

## Design Goals

- Menetapkan `ProductVariant` sebagai unit utama stok dan reservation.
- Memisahkan katalog dari `Service` dan `Resource` Sprint 2.
- Mendukung single-variant product dan multi-variant product tanpa model bercabang.
- Menjaga tenant isolation melalui `organizationId` di seluruh master data bisnis.
- Menyiapkan fondasi untuk procurement, stock transfer, dan fulfillment di sprint berikutnya.

## Domain Boundaries

### Catalog

- Product categories
- Brands
- Product attributes
- Product attribute values
- Products
- Product variants
- Product tags
- Product images and attachments

### Commercial Support

- Product barcodes
- Product bundles
- Product suppliers
- Imports and exports

### Inventory Support

- Units of measure
- Unit conversions
- Default stocking configuration
- Warehouse linkage

## Key Invariants

- Satu product minimal memiliki satu variant.
- Hanya satu default variant per product.
- Stock tidak disimpan langsung di product.
- SKU unik per organization.
- Variant attribute combination unik per product.
- Tracking type product dan inventory item harus sinkron.
