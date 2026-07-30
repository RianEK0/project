import Link from 'next/link';

import { StatusBadge, SurfaceCard } from '@nova/ui';

import { dashboardCatalog } from './dashboard-catalog';

const builderCards = [
  {
    href: '/app/dashboards/dashboard-builder',
    label: 'Dashboard Builder',
    description:
      'Let users assemble chart, metric, card, gauge, map, timeline, calendar, and kanban widgets into their own operational boards.',
    badge: 'Self-Serve',
  },
] as const;

export function DashboardsHub() {
  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-indigo-700 dark:text-indigo-300">
              Dashboards Workspace
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Executive and domain scorecards in one control surface
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Executive Ready</StatusBadge>
            <StatusBadge tone="success">Domain Scorecards</StatusBadge>
            <StatusBadge tone="success">Preview APIs Wired</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Workspace ini menggabungkan executive, CEO, finance, inventory, warehouse, sales, CRM, HR,
          dan manufacturing dashboards ke satu titik masuk. Tujuannya bukan menggandakan modul
          transaksi, tetapi merangkum sinyal terpenting agar pengambilan keputusan lebih cepat,
          sekaligus membuka self-serve dashboard builder untuk board operasional baru.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 md:grid-cols-2">
        {builderCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <SurfaceCard className="flex h-full flex-col justify-between gap-4 transition hover:-translate-y-0.5 hover:border-indigo-300">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold">{card.label}</p>
                  <StatusBadge tone="success">{card.badge}</StatusBadge>
                </div>
                <p className="text-sm leading-6 text-muted">{card.description}</p>
              </div>
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                Open builder
              </p>
            </SurfaceCard>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboardCatalog.map((card) => (
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
              <p className={`text-sm font-medium ${card.actionClassName}`}>Open dashboard</p>
            </SurfaceCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
