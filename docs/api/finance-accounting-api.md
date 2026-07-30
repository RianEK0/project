# Finance / Accounting API Foundation

Endpoint finance/accounting NovaERP disediakan pada `/api/v1` sebagai bounded slices terpisah namun saling terhubung.

## Endpoints

- `GET /chart-of-accounts`
- `GET /general-ledger`
- `GET /journals`
- `GET /journals/metadata`
- `GET /accounting-postings`
- `GET /accounting-vouchers`
- `GET /bank-accounts`
- `GET /cash-accounts`
- `GET /budgets`
- `GET /fixed-assets`
- `GET /depreciation`
- `GET /depreciation/preview`
- `GET /cost-centers`
- `GET /fiscal-years`
- `GET /currencies`
- `GET /exchange-rates`
- `GET /financial-statements`
- `GET /financial-statements/catalog`

## Response Shape

- Semua endpoint tetap mengikuti envelope API standar NovaERP.
- Pada sprint foundation ini, endpoint mengembalikan starter metadata, transition matrix, kategori, status, dan preview data agar frontend finance dapat dibangun tanpa menunggu posting engine production lengkap.

## Boundaries

- Finance foundation tidak menggandakan transaksi bisnis inti.
- Journal, posting, voucher, dan statement diposisikan sebagai layer finance yang menerima context dari module operasional lainnya.
