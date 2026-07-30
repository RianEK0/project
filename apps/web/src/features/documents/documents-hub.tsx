import Link from 'next/link';

import { StatusBadge, SurfaceCard } from '@nova/ui';

import { documentAreaCards, documentCapabilityCatalog } from './document-capability-catalog';

export function DocumentsHub() {
  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">
              Documents Workspace
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Govern enterprise files, business records, and reusable knowledge in one surface
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">File + Record Ready</StatusBadge>
            <StatusBadge tone="success">Preview APIs Wired</StatusBadge>
            <StatusBadge tone="success">Knowledge Governance</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Workspace dokumen ini menyatukan PDF, Word, Excel, contract, invoice, company SOP, manual,
          training, dan policy sebagai permukaan enterprise yang lebih governed. Fokusnya adalah
          akses, review, dan knowledge continuity tanpa menggandakan workflow finance, procurement,
          HR, compliance, atau AI document intelligence yang sudah ada.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 md:grid-cols-3">
        {documentAreaCards.map((card) => (
          <SurfaceCard key={card.id} className={`space-y-3 border ${card.className}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-semibold">{card.label}</p>
              <StatusBadge tone="neutral">{card.badge}</StatusBadge>
            </div>
            <p className="text-sm leading-6 text-muted">{card.summary}</p>
          </SurfaceCard>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {documentCapabilityCatalog.map((capability) => (
          <Link key={capability.href} href={capability.href}>
            <SurfaceCard
              className={`flex h-full flex-col justify-between gap-4 transition hover:-translate-y-0.5 ${capability.hoverClassName}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold">{capability.label}</p>
                    <p
                      className={`text-xs uppercase tracking-[0.18em] ${capability.eyebrowClassName}`}
                    >
                      {capability.eyebrow}
                    </p>
                  </div>
                  <StatusBadge tone="neutral">{capability.badge}</StatusBadge>
                </div>
                <p className="text-sm leading-6 text-muted">{capability.description}</p>
              </div>
              <p className={`text-sm font-medium ${capability.actionClassName}`}>Open capability</p>
            </SurfaceCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
