# Dashboard Workspace

## Scope

Dashboard workspace menjadi jalur ringkas untuk membaca sinyal lintas domain tanpa harus membuka modul operasional satu per satu. Sprint ini menyiapkan:

- executive dashboard,
- CEO dashboard,
- finance dashboard,
- inventory dashboard,
- warehouse dashboard,
- sales dashboard,
- CRM dashboard,
- HR dashboard,
- manufacturing dashboard,
- self-serve dashboard builder untuk widget chart, metric, card, gauge, map, timeline, calendar, dan kanban.

## Design Notes

- Dashboard tidak menggandakan bounded context transaksi.
- Setiap dashboard mengonsumsi ringkasan atau preview dari domain yang sudah ada.
- Workspace `/app/dashboards` menjadi titik masuk tunggal untuk persona eksekutif maupun operator domain, sekaligus tempat publish board buatan user.
- Shared contract mencakup audience, time window, signal tone, dan dashboard briefing permission.

## API Shape

- `GET /api/v1/executive-dashboard`
- `GET /api/v1/executive-dashboard/preview`
- `GET /api/v1/ceo-dashboard`
- `GET /api/v1/ceo-dashboard/briefing-preview`
- `GET /api/v1/finance-dashboard`
- `GET /api/v1/finance-dashboard/scorecard-preview`
- `GET /api/v1/inventory-dashboard`
- `GET /api/v1/inventory-dashboard/health-preview`
- `GET /api/v1/warehouse-dashboard`
- `GET /api/v1/warehouse-dashboard/control-tower-preview`
- `GET /api/v1/hr-dashboard`
- `GET /api/v1/hr-dashboard/people-ops-preview`
- `GET /api/v1/manufacturing-dashboard`
- `GET /api/v1/manufacturing-dashboard/throughput-preview`
- `GET /api/v1/dashboard-builder`
- `POST /api/v1/dashboard-builder/preview`

## Frontend Shape

- `/app/dashboards`
- `/app/dashboards/executive`
- `/app/dashboards/ceo`
- `/app/dashboards/finance`
- `/app/dashboards/inventory`
- `/app/dashboards/warehouse`
- `/app/dashboards/sales`
- `/app/dashboards/crm`
- `/app/dashboards/hr`
- `/app/dashboards/manufacturing`
- `/app/dashboards/dashboard-builder`
