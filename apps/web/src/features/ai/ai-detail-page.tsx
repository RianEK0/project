import Link from 'next/link';

import { StatusBadge, SurfaceCard } from '@nova/ui';

import { compactCopy } from '@/lib/compact-copy';

import { AiApiPreviewPanel } from './ai-api-preview-panel';
import { type AiCapabilityItem } from './ai-capability-catalog';

export function AiDetailPage({ capability }: { capability: AiCapabilityItem }) {
  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-4 rounded-[34px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1.5">
            <p className={`text-sm uppercase tracking-[0.24em] ${capability.eyebrowClassName}`}>
              {capability.eyebrow}
            </p>
            <h2 className="font-display text-3xl font-semibold">{capability.label}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">AI Workspace</StatusBadge>
            <StatusBadge tone="neutral">{capability.badge}</StatusBadge>
          </div>
        </div>

        <p className="max-w-2xl text-sm leading-6 text-muted">
          {compactCopy(capability.description, 132)}
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard className="space-y-4 rounded-[30px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Fokus</p>
              <h3 className="text-xl font-semibold">Yang dikerjakan capability ini</h3>
            </div>
            <StatusBadge tone="neutral">{capability.highlights.length} fokus</StatusBadge>
          </div>
          <div className="grid gap-3">
            {capability.highlights.map((highlight) => (
              <div
                key={highlight}
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm leading-6 dark:border-slate-800 dark:bg-slate-950/70"
              >
                {highlight}
              </div>
            ))}
          </div>
        </SurfaceCard>

        <AiApiPreviewPanel capability={capability} />
      </div>

      <SurfaceCard className="space-y-4 rounded-[30px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">Rute terkait</p>
            <h3 className="text-xl font-semibold">Lanjut ke jalur yang terhubung</h3>
          </div>
          <StatusBadge tone="neutral">{capability.relatedLinks.length} jalur</StatusBadge>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {capability.relatedLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-2xl border border-slate-200/80 px-4 py-3 text-sm font-medium transition ${capability.hoverClassName}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
