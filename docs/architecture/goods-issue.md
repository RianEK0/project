# Goods Issue

Goods issue Sprint 3B adalah outbound flow yang menghubungkan reservation bisnis, allocation operasional, picking, packing, dispatch, dan posting stok keluar.

## Rules

- issue tidak boleh dipost tanpa allocation final,
- reservation baru dianggap fulfilled saat issue dipost, bukan saat pick,
- serial dan lot harus cocok dengan allocation,
- posting membuat `InventoryMovement` bertipe `ISSUE` atau `DISPATCH`.
