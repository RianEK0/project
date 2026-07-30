export type MobileCapabilitySlug =
  | 'pwa'
  | 'offline-sync'
  | 'barcode'
  | 'qr'
  | 'camera'
  | 'gps'
  | 'push-notification'
  | 'dark-mode'
  | 'tablet-ui'
  | 'warehouse-ui';

export type MobileCapabilityItem = {
  slug: MobileCapabilitySlug;
  href: string;
  label: string;
  badge: string;
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  relatedLinks: Array<{
    href: string;
    label: string;
  }>;
  eyebrowClassName: string;
  hoverClassName: string;
  actionClassName: string;
  apiPreview: 'pwa' | 'offline-sync' | 'warehouse-ui' | null;
  touchSurface: 'tablet' | 'warehouse' | null;
};

export const mobileCapabilityCatalog: MobileCapabilityItem[] = [
  {
    slug: 'pwa',
    href: '/app/mobile/pwa',
    label: 'PWA',
    badge: 'Installable',
    eyebrow: 'PWA',
    title: 'Turn NovaERP into an installable operational shell',
    description:
      'PWA workspace menyiapkan manifest, service worker, shortcut, dan installability foundation untuk operator dan supervisor lapangan.',
    highlights: [
      'Manifest and service worker readiness',
      'Installable shell behavior',
      'Offline route coverage',
      'Push-ready foundation',
    ],
    relatedLinks: [
      { href: '/app/mobile/offline-sync', label: 'Offline sync' },
      { href: '/app/mobile/push-notification', label: 'Push notification' },
      { href: '/app/mobile/warehouse-ui', label: 'Warehouse UI' },
    ],
    eyebrowClassName: 'text-slate-700 dark:text-slate-300',
    hoverClassName: 'hover:border-slate-400',
    actionClassName: 'text-slate-700 dark:text-slate-300',
    apiPreview: 'pwa',
    touchSurface: null,
  },
  {
    slug: 'offline-sync',
    href: '/app/mobile/offline-sync',
    label: 'Offline Sync',
    badge: 'Queue',
    eyebrow: 'Offline Sync',
    title: 'Keep device-side work moving when coverage is unstable',
    description:
      'Offline sync surface memfokuskan queue depth, replay success, stale age, dan conflict handling untuk mutation field operations.',
    highlights: [
      'Buffered mutation queue',
      'Replay success rate',
      'Conflict visibility',
      'Shift-safe recovery policy',
    ],
    relatedLinks: [
      { href: '/app/mobile/pwa', label: 'PWA' },
      { href: '/app/mobile/warehouse-ui', label: 'Warehouse UI' },
      { href: '/app/warehouse-operations/tasks/my-tasks', label: 'My tasks' },
    ],
    eyebrowClassName: 'text-violet-700 dark:text-violet-300',
    hoverClassName: 'hover:border-violet-300',
    actionClassName: 'text-violet-700 dark:text-violet-300',
    apiPreview: 'offline-sync',
    touchSurface: null,
  },
  {
    slug: 'barcode',
    href: '/app/mobile/barcode',
    label: 'Barcode',
    badge: 'Scanner',
    eyebrow: 'Barcode',
    title: 'Use barcode-first flows for fast stock and task execution',
    description:
      'Barcode lane memprioritaskan handheld scanning untuk product, location, lot, serial, dan document code yang sudah ada di warehouse foundation.',
    highlights: [
      'Numeric barcode fallback',
      'Product and location scan workflow',
      'Warehouse task tie-in',
      'Touch-first resolution pattern',
    ],
    relatedLinks: [
      { href: '/app/warehouse-operations/scan', label: 'Warehouse scan' },
      { href: '/app/mobile/qr', label: 'QR capability' },
      { href: '/app/mobile/warehouse-ui', label: 'Warehouse UI' },
    ],
    eyebrowClassName: 'text-emerald-700 dark:text-emerald-300',
    hoverClassName: 'hover:border-emerald-300',
    actionClassName: 'text-emerald-700 dark:text-emerald-300',
    apiPreview: null,
    touchSurface: null,
  },
  {
    slug: 'qr',
    href: '/app/mobile/qr',
    label: 'QR',
    badge: '2D Code',
    eyebrow: 'QR',
    title: 'Support richer labels and touch-entry alternatives for field execution',
    description:
      'QR lane melengkapi barcode dengan payload yang lebih kaya untuk pallet, package, asset, dan dokumen operasional.',
    highlights: [
      '2D code payload support',
      'Camera-assisted scan entry',
      'Package and document handoff',
      'Touch-friendly operator fallback',
    ],
    relatedLinks: [
      { href: '/app/mobile/barcode', label: 'Barcode capability' },
      { href: '/app/mobile/camera', label: 'Camera capability' },
      { href: '/app/warehouse-operations/scan', label: 'Warehouse scan' },
    ],
    eyebrowClassName: 'text-teal-700 dark:text-teal-300',
    hoverClassName: 'hover:border-teal-300',
    actionClassName: 'text-teal-700 dark:text-teal-300',
    apiPreview: null,
    touchSurface: null,
  },
  {
    slug: 'camera',
    href: '/app/mobile/camera',
    label: 'Camera',
    badge: 'Device I/O',
    eyebrow: 'Camera',
    title: 'Open camera-backed capture flows for scan, evidence, and inspection',
    description:
      'Camera lane menyiapkan akses browser ke device camera untuk scan, proof capture, dan quality evidence starter.',
    highlights: [
      'getUserMedia compatibility',
      'Scan and image capture foundation',
      'Inspection photo starter',
      'Touch-optimized permission flow',
    ],
    relatedLinks: [
      { href: '/app/mobile/barcode', label: 'Barcode capability' },
      { href: '/app/mobile/qr', label: 'QR capability' },
      { href: '/app/manufacturing/quality-control', label: 'Quality control' },
    ],
    eyebrowClassName: 'text-cyan-700 dark:text-cyan-300',
    hoverClassName: 'hover:border-cyan-300',
    actionClassName: 'text-cyan-700 dark:text-cyan-300',
    apiPreview: null,
    touchSurface: null,
  },
  {
    slug: 'gps',
    href: '/app/mobile/gps',
    label: 'GPS',
    badge: 'Location',
    eyebrow: 'GPS',
    title: 'Use location awareness for field confirmation and movement traceability',
    description:
      'GPS lane menyiapkan geolocation support untuk dispatch confirmation, yard positioning, dan route-adjacent proof of presence.',
    highlights: [
      'Browser geolocation readiness',
      'Dispatch and field traceability',
      'Location permission handling',
      'Coverage-aware execution starter',
    ],
    relatedLinks: [
      { href: '/app/mobile/push-notification', label: 'Push notification' },
      { href: '/app/mobile/warehouse-ui', label: 'Warehouse UI' },
      { href: '/app/operations', label: 'Operations' },
    ],
    eyebrowClassName: 'text-lime-700 dark:text-lime-300',
    hoverClassName: 'hover:border-lime-300',
    actionClassName: 'text-lime-700 dark:text-lime-300',
    apiPreview: null,
    touchSurface: null,
  },
  {
    slug: 'push-notification',
    href: '/app/mobile/push-notification',
    label: 'Push Notification',
    badge: 'Engagement',
    eyebrow: 'Push Notification',
    title: 'Bring urgent operational prompts back to the device lock screen',
    description:
      'Push notification lane menyiapkan subscription dan prompt flow untuk acknowledgement, assignment, dan escalation starter.',
    highlights: [
      'Push subscription readiness',
      'Permission state visibility',
      'Task acknowledgement prompts',
      'PWA-linked delivery foundation',
    ],
    relatedLinks: [
      { href: '/app/mobile/pwa', label: 'PWA' },
      { href: '/app/mobile/offline-sync', label: 'Offline sync' },
      { href: '/app/automation/reminders', label: 'Automation reminders' },
    ],
    eyebrowClassName: 'text-amber-700 dark:text-amber-300',
    hoverClassName: 'hover:border-amber-300',
    actionClassName: 'text-amber-700 dark:text-amber-300',
    apiPreview: null,
    touchSurface: null,
  },
  {
    slug: 'dark-mode',
    href: '/app/mobile/dark-mode',
    label: 'Dark Mode',
    badge: 'Theme',
    eyebrow: 'Dark Mode',
    title: 'Give operators a low-glare UI mode for long shifts and dim environments',
    description:
      'Dark mode lane memindahkan theme support dari sekadar provider menjadi kontrol nyata di dashboard shell dan mobile workspace.',
    highlights: [
      'Manual theme toggle',
      'System theme fallback',
      'Low-glare operational surface',
      'Consistent shell-wide styling',
    ],
    relatedLinks: [
      { href: '/app/mobile/tablet-ui', label: 'Tablet UI' },
      { href: '/app/mobile/warehouse-ui', label: 'Warehouse UI' },
      { href: '/app', label: 'Dashboard shell' },
    ],
    eyebrowClassName: 'text-indigo-700 dark:text-indigo-300',
    hoverClassName: 'hover:border-indigo-300',
    actionClassName: 'text-indigo-700 dark:text-indigo-300',
    apiPreview: null,
    touchSurface: null,
  },
  {
    slug: 'tablet-ui',
    href: '/app/mobile/tablet-ui',
    label: 'Tablet UI',
    badge: 'Touch Surface',
    eyebrow: 'Tablet UI',
    title: 'Lay out supervisor-ready boards and larger touch targets for tablets',
    description:
      'Tablet UI lane memfokuskan board, touch spacing, dan panel operasional yang nyaman dibaca dari meja receiving, dispatch, atau floor lead.',
    highlights: [
      'Large touch targets',
      'Supervisor board layout',
      'Landscape-friendly surface',
      'Shared warehouse dashboard linkages',
    ],
    relatedLinks: [
      { href: '/app/mobile/warehouse-ui', label: 'Warehouse UI' },
      { href: '/app/dashboards/warehouse', label: 'Warehouse dashboard' },
      { href: '/app/warehouse-operations/receipts', label: 'Receipts' },
    ],
    eyebrowClassName: 'text-rose-700 dark:text-rose-300',
    hoverClassName: 'hover:border-rose-300',
    actionClassName: 'text-rose-700 dark:text-rose-300',
    apiPreview: 'warehouse-ui',
    touchSurface: 'tablet',
  },
  {
    slug: 'warehouse-ui',
    href: '/app/mobile/warehouse-ui',
    label: 'Warehouse UI',
    badge: 'Handheld',
    eyebrow: 'Warehouse UI',
    title: 'Keep the warehouse execution surface scan-first and glove-friendly',
    description:
      'Warehouse UI lane mengikat scan, picking, putaway, dispatch, push acknowledgement, dan rugged device usage ke satu touch-first execution surface.',
    highlights: [
      'Handheld scan-first layout',
      'Task and acknowledgement flow',
      'Battery and GPS-aware readiness',
      'Tablet and handheld mix visibility',
    ],
    relatedLinks: [
      { href: '/app/warehouse-operations/scan', label: 'Warehouse scan' },
      { href: '/app/warehouse-operations/tasks/my-tasks', label: 'My tasks' },
      { href: '/app/mobile/tablet-ui', label: 'Tablet UI' },
    ],
    eyebrowClassName: 'text-sky-700 dark:text-sky-300',
    hoverClassName: 'hover:border-sky-300',
    actionClassName: 'text-sky-700 dark:text-sky-300',
    apiPreview: 'warehouse-ui',
    touchSurface: 'warehouse',
  },
];

export function getMobileCapabilityItem(capabilitySlug: string): MobileCapabilityItem | undefined {
  return mobileCapabilityCatalog.find((item) => item.slug === capabilitySlug);
}
