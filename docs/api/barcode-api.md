# Barcode API

## Core Endpoints

- `POST /api/v1/product-variants/:variantId/barcodes`
- `GET /api/v1/product-variants/:variantId/barcodes`
- `PATCH /api/v1/product-barcodes/:barcodeId`
- `DELETE /api/v1/product-barcodes/:barcodeId`

## Supporting Endpoints

- `POST /api/v1/product-barcodes/generate`
- `POST /api/v1/product-barcodes/validate`
- `GET /api/v1/product-barcodes/lookup/:barcode`
- `POST /api/v1/product-barcodes/print-labels`
- `GET /api/v1/scan/:code`
