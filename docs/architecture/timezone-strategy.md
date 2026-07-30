# Timezone Strategy

## Rules

- Booking timestamps disimpan sebagai UTC.
- Booking menyimpan `timezone` IANA untuk konteks transaksi.
- Business hours dan schedule exception disimpan sebagai local-time schedule.
- Availability mengubah local schedule ke UTC berdasarkan timezone location.
- UI menampilkan waktu berdasarkan timezone user atau organization.

## Why

Universal booking harus tetap benar untuk lokasi lintas zona waktu dan area yang memakai daylight saving.

## Practical Strategy

- `Booking.startAt/endAt`: UTC
- `Location.timezone`: sumber utama konversi jadwal lokasi
- `BusinessHour.startTime/endTime`: string waktu lokal `HH:mm`
- `ScheduleException.date`: tanggal lokal
