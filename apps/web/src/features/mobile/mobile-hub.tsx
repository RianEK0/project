import Link from 'next/link';

import { StatusBadge, SurfaceCard } from '@nova/ui';

import { mobileCapabilityCatalog } from './mobile-capability-catalog';

export function MobileHub() {
  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-700 dark:text-slate-300">
              Mobile / PWA Workspace
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Device-ready foundation for PWA, touch execution, and warehouse handheld flow
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">PWA Ready</StatusBadge>
            <StatusBadge tone="success">Touch Surfaces</StatusBadge>
            <StatusBadge tone="success">Warehouse Mobile Starter</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Workspace ini merangkum PWA, offline sync, barcode, QR, camera, GPS, push notification,
          dark mode, tablet UI, dan warehouse UI ke satu pintu masuk. Fokusnya adalah touch-first
          execution dan installable browser experience tanpa menduplikasi bounded context
          operasional yang sudah ada.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mobileCapabilityCatalog.map((card) => (
          <Link key={card.href} href={card.href}>
            <SurfaceCard
              className={`flex h-full flex-col justify-between gap-4 transition hover:-translate-y-0.5 ${card.hoverClassName}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold">{card.label}</p>
                  <StatusBadge tone="neutral">{card.badge}</StatusBadge>
                </div>
                <p className="text-sm leading-6 text-muted">{card.description}</p>
              </div>
              <p className={`text-sm font-medium ${card.actionClassName}`}>Open capability</p>
            </SurfaceCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
