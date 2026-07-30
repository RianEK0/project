import Link from 'next/link';

import { StatusBadge, SurfaceCard } from '@nova/ui';

import { analyticsAreaCards, analyticsCapabilityCatalog } from './analytics-capability-catalog';

const builderCards = [
  {
    href: '/app/analytics/bi-builder',
    label: 'BI Builder',
    description:
      'Let business users drag and drop charts, pivots, treemaps, maps, gauges, and forecasts into self-serve dashboards.',
    badge: 'Power BI-style',
  },
  {
    href: '/app/analytics/report-builder',
    label: 'Report Builder',
    description:
      'Compose SELECT, filter, group, sort, join, and export stages visually until a governed report preview is ready.',
    badge: 'Click-built',
  },
] as const;

export function AnalyticsHub() {
  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">
              Analytics / BI Workspace
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Cross-domain business intelligence for domain marts, semantic models, and realtime
              signals
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">BI Workspace</StatusBadge>
            <StatusBadge tone="success">Preview APIs Wired</StatusBadge>
            <StatusBadge tone="success">Domain + Model Ready</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Workspace analytics ini menyatukan domain BI untuk inventory, sales, purchase, accounting,
          HR, manufacturing, booking, CRM, customer, supplier, dan warehouse, lalu menghubungkannya
          dengan semantic modeling seperti fact table, dimension, OLAP, cube, realtime analytics,
          self-serve dashboard builder, dan report builder.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 md:grid-cols-2">
        {builderCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <SurfaceCard className="flex h-full flex-col justify-between gap-4 transition hover:-translate-y-0.5 hover:border-sky-300">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold">{card.label}</p>
                  <StatusBadge tone="success">{card.badge}</StatusBadge>
                </div>
                <p className="text-sm leading-6 text-muted">{card.description}</p>
              </div>
              <p className="text-sm font-medium text-sky-700 dark:text-sky-300">Open builder</p>
            </SurfaceCard>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analyticsAreaCards.map((card) => (
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
        {analyticsCapabilityCatalog.map((capability) => (
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
