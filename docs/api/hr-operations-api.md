# HR / People Operations API Foundation

Endpoint HR / People Operations NovaERP disediakan pada `/api/v1` sebagai bounded slices terpisah namun tetap saling terhubung.

## Endpoints

- `GET /employees`
- `GET /departments`
- `GET /attendance`
- `GET /attendance/preview`
- `GET /leave-requests`
- `GET /leave-requests/balance-preview`
- `GET /payroll`
- `GET /payroll/preview-run`
- `GET /shifts`
- `GET /recruitment`
- `GET /performance`
- `GET /training`
- `GET /kpis`
- `GET /organization-chart`

## Response Shape

- Semua endpoint tetap mengikuti envelope API standar NovaERP.
- Pada sprint foundation ini, endpoint mengembalikan starter metadata, status, preview policy, dan catalog data agar frontend HR dapat dibangun tanpa menunggu workflow production lengkap.

## Boundaries

- HR foundation tidak menggandakan RBAC, tenant, atau accounting engine.
- Attendance, leave, payroll, recruitment, dan performance diposisikan sebagai bounded contexts people operations yang dapat dihubungkan ke finance, organization, dan dashboard internal pada sprint berikutnya.
