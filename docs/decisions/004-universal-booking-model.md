# ADR 004: Universal Booking Model

## Status

Accepted

## Decision

Sprint 2 menggunakan model booking universal berbasis `Service`, `Resource`, `Location`, dan `Booking`, bukan modul vertikal khusus.

## Rationale

- bisa dipakai untuk salon, rental, hotel, konsultasi, dan kelas,
- menghindari duplikasi domain terlalu dini,
- mempermudah ekspansi vertikal pada sprint berikutnya.
