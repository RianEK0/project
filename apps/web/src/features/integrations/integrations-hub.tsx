import Link from 'next/link';

import { StatusBadge, SurfaceCard } from '@nova/ui';

import {
  integrationCategoryCards,
  integrationProviderCatalog,
} from './integration-provider-catalog';

export function IntegrationsHub() {
  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">
              Integrations Workspace
            </p>
            <h2 className="font-display text-3xl font-semibold">
              External provider control plane for payments, messaging, storage, suites, and AI
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Provider Matrix</StatusBadge>
            <StatusBadge tone="success">Preview APIs Wired</StatusBadge>
            <StatusBadge tone="success">Cross-Workspace Ready</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Workspace ini menyatukan payment gateway, productivity suite, messaging, storage, dan AI
          provider ke satu pintu masuk. Fokusnya adalah control plane dan readiness signal, bukan
          menggandakan logic transaksi, automation, CRM, atau AI workspace yang sudah ada.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {integrationCategoryCards.map((card) => (
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
        {integrationProviderCatalog.map((provider) => (
          <Link key={provider.href} href={provider.href}>
            <SurfaceCard
              className={`flex h-full flex-col justify-between gap-4 transition hover:-translate-y-0.5 ${provider.hoverClassName}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-lg font-semibold">{provider.label}</p>
                    <p
                      className={`text-xs uppercase tracking-[0.18em] ${provider.eyebrowClassName}`}
                    >
                      {provider.eyebrow}
                    </p>
                  </div>
                  <StatusBadge tone="neutral">{provider.badge}</StatusBadge>
                </div>
                <p className="text-sm leading-6 text-muted">{provider.description}</p>
              </div>
              <p className={`text-sm font-medium ${provider.actionClassName}`}>Open provider</p>
            </SurfaceCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
