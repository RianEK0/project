import Link from 'next/link';

import { StatusBadge, SurfaceCard } from '@nova/ui';

import { compactCopy } from '@/lib/compact-copy';

import { IntegrationApiPreviewPanel } from './integration-api-preview-panel';
import { type IntegrationProviderItem } from './integration-provider-catalog';

export function IntegrationDetailPage({ provider }: { provider: IntegrationProviderItem }) {
  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className={`text-sm uppercase tracking-[0.24em] ${provider.eyebrowClassName}`}>
              {provider.eyebrow}
            </p>
            <h2 className="font-display text-3xl font-semibold">{provider.label}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Control Plane</StatusBadge>
            <StatusBadge tone="success">Preview Signals Live</StatusBadge>
            <StatusBadge tone="neutral">{provider.badge}</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          {compactCopy(provider.description, 132)}
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Fokus</p>
              <h3 className="text-xl font-semibold">Yang dibuka lebih cepat oleh provider ini</h3>
            </div>
            <StatusBadge tone="neutral">{provider.highlights.length} fokus</StatusBadge>
          </div>
          <div className="grid gap-3">
            {provider.highlights.map((highlight) => (
              <div
                key={highlight}
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm leading-6 dark:border-slate-800 dark:bg-slate-950/70"
              >
                {highlight}
              </div>
            ))}
          </div>
        </SurfaceCard>

        <IntegrationApiPreviewPanel provider={provider} />
      </div>

      <SurfaceCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">Rute terkait</p>
            <h3 className="text-xl font-semibold">Lanjut ke jalur integrasi yang terhubung</h3>
          </div>
          <StatusBadge tone="neutral">{provider.relatedLinks.length} jalur</StatusBadge>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {provider.relatedLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-2xl border border-slate-200/80 px-4 py-3 text-sm font-medium transition ${provider.hoverClassName}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
