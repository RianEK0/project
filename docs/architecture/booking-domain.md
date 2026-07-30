# Booking Domain

NovaERP Sprint 2 menambahkan universal booking engine yang dapat dipakai lintas vertikal bisnis tanpa membuat model domain terlalu sempit pada hotel, travel, atau rental tertentu.

## Core Concepts

- `Customer`: pihak yang memesan atau menerima layanan.
- `Location`: tempat layanan dijalankan, termasuk cabang fisik dan layanan online.
- `Service`: unit layanan yang dapat dipesan.
- `Resource`: aset yang dibutuhkan atau dapat dialokasikan untuk layanan.
- `Availability`: hasil gabungan schedule, exception, block, dan booking aktif.
- `Booking`: transaksi inti yang merepresentasikan reservasi atau pemesanan.
- `Invoice`: snapshot finansial yang diturunkan dari booking.
- `PaymentRecord`: pencatatan pembayaran manual atau semi-manual.

## Design Goals

- Satu engine untuk `TIME_SLOT`, `DATE_RANGE`, `SESSION`, `CAPACITY`, dan `OPEN_SCHEDULE`.
- Tetap multi-tenant dengan `organizationId` di seluruh data bisnis.
- Mendukung satu booking dengan banyak service.
- Menyimpan snapshot transaksi agar perubahan katalog tidak merusak histori.

## Domain Boundaries

### Catalog

- Customers
- Customer groups
- Locations
- Service categories
- Services
- Resource groups
- Resources

### Scheduling

- Business hours
- Schedule exceptions
- Resource blocks
- Availability search
- Temporary booking hold

### Transaction

- Booking
- Booking items
- Booking resources
- Guests
- Notes
- Status history
- Reschedule history

### Financial

- Price rules
- Promotions
- Invoices
- Payment records
- Document sequences

### Operations

- Check-in
- Check-out
- Reminders
- Analytics
