# Warehouse Location Hierarchy

Sprint 3A memakai struktur `Warehouse -> WarehouseZone -> StorageLocation` tanpa membuat model lokasi bisnis baru, karena warehouse dapat terkait ke `Location` Sprint 2.

## Structure

- `Warehouse`: node operasional tertinggi.
- `WarehouseZone`: area fungsional dalam warehouse.
- `StorageLocation`: lokasi fisik atau virtual tempat stok ditaruh.

## Storage Hierarchy

Storage location dapat bersifat bertingkat:

- aisle,
- rack,
- shelf,
- bin,
- pallet,
- room.

## Rules

- Parent location wajib berada di warehouse yang sama.
- Circular hierarchy harus ditolak.
- Blocked location tidak dapat menerima mutation baru.
- Warehouse archived atau inactive tidak boleh dipakai mutation baru.
