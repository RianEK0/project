# ADR 005: Redis Booking Hold

## Status

Accepted

## Decision

Redis dipakai untuk temporary booking hold dengan TTL pendek.

## Rationale

- mengurangi perebutan slot saat user memilih jadwal,
- tidak menggantikan database sebagai sumber kebenaran,
- mendukung UX checkout yang lebih aman.
