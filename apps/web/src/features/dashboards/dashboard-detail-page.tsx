import Link from 'next/link';

import { StatusBadge, SurfaceCard } from '@nova/ui';

import { compactCopy } from '@/lib/compact-copy';

import type { DashboardCatalogItem } from './dashboard-catalog';
import { DashboardPreviewPanel } from './dashboard-preview-panel';

export function DashboardDetailPage({ dashboard }: { dashboard: DashboardCatalogItem }) {
  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className={`text-sm uppercase tracking-[0.24em] ${dashboard.eyebrowClassName}`}>
              {dashboard.eyebrow}
            </p>
            <h2 className="font-display text-3xl font-semibold">{dashboard.label}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Workspace Ready</StatusBadge>
            <StatusBadge tone="success">API Preview Live</StatusBadge>
            <StatusBadge tone="neutral">{dashboard.badge}</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          {compactCopy(dashboard.description, 132)}
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Fokus</p>
              <h3 className="text-xl font-semibold">Yang perlu cepat terlihat di dashboard ini</h3>
            </div>
            <StatusBadge tone="neutral">{dashboard.highlights.length} sinyal</StatusBadge>
          </div>
          <div className="grid gap-3">
            {dashboard.highlights.map((highlight) => (
              <div
                key={highlight}
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm leading-6 dark:border-slate-800 dark:bg-slate-950/70"
              >
                {highlight}
              </div>
            ))}
          </div>
        </SurfaceCard>

        <DashboardPreviewPanel dashboardSlug={dashboard.slug} />
      </div>

      <SurfaceCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">Rute terkait</p>
            <h3 className="text-xl font-semibold">Lanjut ke jalur workspace yang terhubung</h3>
          </div>
          <StatusBadge tone="neutral">{dashboard.relatedLinks.length} jalur</StatusBadge>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {dashboard.relatedLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-2xl border border-slate-200/80 px-4 py-3 text-sm font-medium transition ${dashboard.hoverClassName}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
