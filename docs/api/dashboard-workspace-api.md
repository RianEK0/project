# Dashboard Workspace API

## Overview

Dashboard workspace API memberikan foundation response dan preview response untuk membaca scorecard lintas domain sekaligus menyiapkan self-serve dashboard builder.

## Endpoints

### Executive Dashboard

- `GET /api/v1/executive-dashboard`
- `GET /api/v1/executive-dashboard/preview`

### CEO Dashboard

- `GET /api/v1/ceo-dashboard`
- `GET /api/v1/ceo-dashboard/briefing-preview`

### Finance Dashboard

- `GET /api/v1/finance-dashboard`
- `GET /api/v1/finance-dashboard/scorecard-preview`

### Inventory Dashboard

- `GET /api/v1/inventory-dashboard`
- `GET /api/v1/inventory-dashboard/health-preview`

### Warehouse Dashboard

- `GET /api/v1/warehouse-dashboard`
- `GET /api/v1/warehouse-dashboard/control-tower-preview`

### HR Dashboard

- `GET /api/v1/hr-dashboard`
- `GET /api/v1/hr-dashboard/people-ops-preview`

### Manufacturing Dashboard

- `GET /api/v1/manufacturing-dashboard`
- `GET /api/v1/manufacturing-dashboard/throughput-preview`

### Dashboard Builder

- `GET /api/v1/dashboard-builder`
- `POST /api/v1/dashboard-builder/preview`

## Existing Related Endpoints

- `GET /api/v1/sales-dashboard` untuk CRM dashboard starter.
- `GET /api/v1/sales-analytics/dashboard` untuk sales dashboard starter.
- `GET /api/v1/inventory-movement-analytics/dashboard` untuk warehouse analytics pendukung.
- `GET /api/v1/purchase-analytics/dashboard` untuk procurement analytics pendukung.
