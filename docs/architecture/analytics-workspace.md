# Analytics / BI Workspace

## Scope

Analytics / BI workspace menjadi bounded context intelligence NovaERP untuk merangkum readiness BI lintas domain tanpa menggandakan transaksi sumber. Sprint ini menyiapkan:

- lane analytics domain untuk inventory, sales, purchase, accounting, HR, manufacturing, booking, dan CRM,
- entity intelligence untuk customer, supplier, dan warehouse,
- semantic modeling untuk fact table, dimension, OLAP, dan cube,
- realtime analytics lane untuk freshness-sensitive monitoring dan alert coverage,
- BI builder untuk drag-and-drop dashboard seperti Power BI,
- report builder untuk click-built report pipeline.

## Design Notes

- Workspace `/app/analytics` menjadi titik masuk tunggal untuk business intelligence lintas domain, entity review, semantic modeling, dan realtime monitoring.
- Analytics workspace tidak menggantikan dashboard domain, sales analytics, purchase analytics, AI analytics, atau financial statements; ia menghubungkan semuanya sebagai surface BI terpadu.
- Preview API dipisah menjadi domain operations, entity intelligence, semantic model, dan realtime agar readiness per lane bisa berkembang independen.
- Shared contract menyiapkan capability key, area, status, permission, dan document type untuk evolusi mart governance, cube packaging, dan stream analytics berikutnya.

## Frontend Shape

- `/app/analytics`
- `/app/analytics/inventory`
- `/app/analytics/sales`
- `/app/analytics/purchase`
- `/app/analytics/accounting`
- `/app/analytics/hr`
- `/app/analytics/manufacturing`
- `/app/analytics/booking`
- `/app/analytics/crm`
- `/app/analytics/customer`
- `/app/analytics/supplier`
- `/app/analytics/warehouse`
- `/app/analytics/fact-table`
- `/app/analytics/dimension`
- `/app/analytics/olap`
- `/app/analytics/cube`
- `/app/analytics/realtime-analytics`
- `/app/analytics/bi-builder`
- `/app/analytics/report-builder`

## API Shape

- `GET /api/v1/analytics-workspace`
- `GET /api/v1/analytics-workspace/operations-preview`
- `GET /api/v1/analytics-workspace/entity-preview`
- `GET /api/v1/analytics-workspace/modeling-preview`
- `GET /api/v1/analytics-workspace/realtime-preview`
- `GET /api/v1/bi-builder`
- `POST /api/v1/bi-builder/preview`
- `GET /api/v1/report-builder`
- `POST /api/v1/report-builder/preview`
