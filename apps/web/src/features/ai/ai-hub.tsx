import Link from 'next/link';

import { StatusBadge, SurfaceCard } from '@nova/ui';

import { compactCopy } from '@/lib/compact-copy';

import { aiAreaCards, aiCapabilityCatalog, aiFoundationRouteCards } from './ai-capability-catalog';

export function AiHub() {
  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-4 rounded-[34px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1.5">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-300">
              AI Workspace
            </p>
            <h2 className="font-display text-3xl font-semibold">AI untuk kerja harian NovaERP</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Cross-domain</StatusBadge>
            <StatusBadge tone="success">Preview live</StatusBadge>
          </div>
        </div>

        <p className="max-w-2xl text-sm leading-6 text-muted">
          Semua jalur AI dikumpulkan di satu tempat agar lebih mudah dibuka, diuji, dan dipakai.
        </p>
      </SurfaceCard>

      <Link href="/app/ai/copilot">
        <SurfaceCard className="rounded-[32px] border-cyan-200/80 bg-cyan-50/70 transition hover:-translate-y-0.5 hover:border-cyan-400 dark:border-cyan-900/60 dark:bg-cyan-950/20">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-1.5">
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-300">
                Focus
              </p>
              <h3 className="text-2xl font-semibold">AI Copilot untuk tanya, rangkum, dan lanjutkan aksi</h3>
              <p className="max-w-2xl text-sm leading-6 text-muted">
                Cocok untuk laporan, stok kritis, dan insight cepat.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="success">Safe Query</StatusBadge>
              <StatusBadge tone="neutral">Open</StatusBadge>
            </div>
          </div>
        </SurfaceCard>
      </Link>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {aiAreaCards.map((card) => (
          <SurfaceCard key={card.id} className={`space-y-2.5 rounded-[28px] border ${card.className}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-semibold">{card.label}</p>
              <StatusBadge tone="neutral">{card.badge}</StatusBadge>
            </div>
            <p className="text-sm leading-6 text-muted">{compactCopy(card.summary, 96)}</p>
          </SurfaceCard>
        ))}
      </div>

      <SurfaceCard className="space-y-4 rounded-[32px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">Capabilities</p>
            <h3 className="text-xl font-semibold">Pilih capability AI</h3>
          </div>
          <StatusBadge tone="neutral">{aiCapabilityCatalog.length} capabilities</StatusBadge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {aiCapabilityCatalog.map((capability) => (
            <Link key={capability.href} href={capability.href}>
              <SurfaceCard
                className={`flex h-full flex-col justify-between gap-4 transition hover:-translate-y-0.5 ${capability.hoverClassName}`}
              >
                <div className="space-y-2">
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
                </div>
                <p className={`text-sm font-medium ${capability.actionClassName}`}>
                  Buka capability
                </p>
              </SurfaceCard>
            </Link>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard className="space-y-4 rounded-[32px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">Routes</p>
            <h3 className="text-xl font-semibold">Jalur AI yang aktif</h3>
          </div>
          <StatusBadge tone="neutral">{aiFoundationRouteCards.length} routes</StatusBadge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {aiFoundationRouteCards.map((card) => (
            <Link key={card.href} href={card.href}>
              <SurfaceCard className="flex h-full flex-col justify-between gap-4 transition hover:-translate-y-0.5 hover:border-cyan-300">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-semibold">{card.label}</p>
                    <StatusBadge tone="neutral">{card.badge}</StatusBadge>
                  </div>
                </div>
                <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Buka route</p>
              </SurfaceCard>
            </Link>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
