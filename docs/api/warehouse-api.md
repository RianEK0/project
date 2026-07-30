# Warehouse API

## Core Endpoints

- `POST /api/v1/warehouses`
- `GET /api/v1/warehouses`
- `GET /api/v1/warehouses/:warehouseId`
- `PATCH /api/v1/warehouses/:warehouseId`
- `DELETE /api/v1/warehouses/:warehouseId`

## Hierarchy Endpoints

- `POST /api/v1/warehouses/:warehouseId/zones`
- `GET /api/v1/warehouses/:warehouseId/zones`
- `POST /api/v1/warehouses/:warehouseId/storage-locations`
- `GET /api/v1/storage-locations/tree`
