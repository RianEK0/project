# Product API

## Core Endpoints

- `POST /api/v1/products`
- `GET /api/v1/products`
- `GET /api/v1/products/:productId`
- `PATCH /api/v1/products/:productId`
- `DELETE /api/v1/products/:productId`

## Variant Endpoints

- `POST /api/v1/products/:productId/variants`
- `GET /api/v1/products/:productId/variants`
- `POST /api/v1/products/:productId/variants/generate-preview`
- `POST /api/v1/products/:productId/variants/generate`

## Media and Linking

- `PUT /api/v1/products/:productId/tags`
- `PUT /api/v1/products/:productId/suppliers`
- `POST /api/v1/products/:productId/images`
- `POST /api/v1/products/:productId/attachments`
