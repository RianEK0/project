# Booking API

## Core Endpoints

- `POST /api/v1/bookings`
- `GET /api/v1/bookings`
- `GET /api/v1/bookings/:bookingId`
- `PATCH /api/v1/bookings/:bookingId`
- `DELETE /api/v1/bookings/:bookingId`

## Status Actions

- `POST /api/v1/bookings/:bookingId/submit`
- `POST /api/v1/bookings/:bookingId/approve`
- `POST /api/v1/bookings/:bookingId/confirm`
- `POST /api/v1/bookings/:bookingId/reschedule`
- `POST /api/v1/bookings/:bookingId/cancel`
- `POST /api/v1/bookings/:bookingId/check-in`
- `POST /api/v1/bookings/:bookingId/check-out`
- `POST /api/v1/bookings/:bookingId/complete`
- `POST /api/v1/bookings/:bookingId/mark-no-show`

## Supporting Endpoints

- `GET /api/v1/bookings/:bookingId/timeline`
- `GET /api/v1/bookings/:bookingId/price-breakdown`
- `GET /api/v1/bookings/:bookingId/availability-validation`
- `POST /api/v1/bookings/:bookingId/notes`
- `GET /api/v1/bookings/:bookingId/notes`
