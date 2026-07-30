# Reservation API

## Core Endpoints

- `POST /api/v1/inventory-reservations`
- `GET /api/v1/inventory-reservations`
- `GET /api/v1/inventory-reservations/:reservationId`
- `PATCH /api/v1/inventory-reservations/:reservationId`

## Actions

- `POST /api/v1/inventory-reservations/:reservationId/activate`
- `POST /api/v1/inventory-reservations/:reservationId/release`
- `POST /api/v1/inventory-reservations/:reservationId/cancel`
- `POST /api/v1/inventory-reservations/:reservationId/expire`
