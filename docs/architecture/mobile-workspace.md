# Mobile Workspace

## Scope

Mobile workspace menjadi fondasi untuk pengalaman touch-first NovaERP pada browser modern, tablet, dan perangkat warehouse handheld. Sprint ini menyiapkan:

- PWA shell,
- offline sync preview,
- barcode dan QR capability lane,
- camera dan GPS support lane,
- push notification starter,
- dark mode toggle,
- tablet UI dan warehouse UI starter.

## Design Notes

- Workspace `/app/mobile` menjadi titik masuk tunggal untuk capability mobile dan device.
- PWA foundation memakai manifest dan service worker tanpa menggandakan auth atau routing utama.
- Offline sync saat ini masih berupa preview policy untuk queue depth, replay rate, stale age, dan conflict handling.
- Warehouse UI memanfaatkan route scanning dan warehouse task yang sudah ada sebagai jalur execution utama.

## Frontend Shape

- `/app/mobile`
- `/app/mobile/pwa`
- `/app/mobile/offline-sync`
- `/app/mobile/barcode`
- `/app/mobile/qr`
- `/app/mobile/camera`
- `/app/mobile/gps`
- `/app/mobile/push-notification`
- `/app/mobile/dark-mode`
- `/app/mobile/tablet-ui`
- `/app/mobile/warehouse-ui`

## API Shape

- `GET /api/v1/mobile-workspace`
- `GET /api/v1/mobile-workspace/pwa-preview`
- `GET /api/v1/mobile-workspace/offline-sync-preview`
- `GET /api/v1/mobile-workspace/warehouse-ui-preview`
