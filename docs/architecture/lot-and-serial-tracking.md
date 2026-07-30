# Lot and Serial Tracking

Sprint 3A mendukung tiga mode tracking inventory:

- `QUANTITY`
- `LOT`
- `SERIAL`

## Lot Tracking

- lot unik per organization dan variant,
- expiration dan quarantine memengaruhi availability,
- expired lot tidak boleh dianggap available.

## Serial Tracking

- serial unik per organization,
- satu serial hanya boleh berada di satu lokasi pada satu waktu,
- serial status berubah melalui service khusus, bukan controller langsung.

## Expiration

- dapat melekat ke lot atau serial,
- warning threshold configurable,
- perubahan status expired harus tetap audit-safe.
