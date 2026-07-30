# Manufacturing / Production Operations API Foundation

Endpoint Manufacturing / Production Operations NovaERP disediakan pada `/api/v1` sebagai bounded slices terpisah namun tetap saling terhubung.

## Endpoints

- `GET /bill-of-materials`
- `GET /bill-of-materials/explosion-preview`
- `GET /production`
- `GET /work-orders`
- `GET /routing`
- `GET /machines`
- `GET /maintenance`
- `GET /quality-control`
- `GET /scrap`
- `GET /production-planning`
- `GET /mrp`
- `GET /mrp/net-requirement-preview`
- `GET /capacity-planning`
- `GET /capacity-planning/load-preview`

## Response Shape

- Semua endpoint tetap mengikuti envelope API standar NovaERP.
- Pada sprint foundation ini, endpoint mengembalikan starter metadata, status, preview explosion, preview MRP, dan preview load agar frontend manufacturing dapat dibangun tanpa menunggu scheduling engine production lengkap.

## Boundaries

- Manufacturing foundation tidak menggandakan product, inventory, procurement, HR, atau finance engine.
- BOM, planning, MRP, work order, quality, maintenance, dan capacity diposisikan sebagai bounded contexts manufacturing yang akan terhubung lebih dalam ke costing, procurement, dan warehouse pada sprint berikutnya.
