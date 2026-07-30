# Purchase Order API

## Endpoints

- `POST /api/v1/purchase-orders`
- `GET /api/v1/purchase-orders`
- `GET /api/v1/purchase-orders/:orderId`
- `PATCH /api/v1/purchase-orders/:orderId`
- `POST /api/v1/purchase-orders/:orderId/submit`
- `POST /api/v1/purchase-orders/:orderId/approve`
- `POST /api/v1/purchase-orders/:orderId/send`
- `POST /api/v1/purchase-orders/:orderId/cancel`
- `POST /api/v1/purchase-orders/:orderId/close`
- `GET /api/v1/purchase-orders/metadata`

## Downstream

- `GET /api/v1/purchase-receipts`
- `GET /api/v1/purchase-invoice-preparation`
