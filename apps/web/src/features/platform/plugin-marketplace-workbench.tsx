'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import {
  type PluginMarketplaceInstallScope,
  type PluginMarketplacePackageType,
  type PluginMarketplaceVertical,
} from '@nova/shared-types';

import { platformApi } from '@/services/api/platform';

const statusToneMap = {
  DRAFT: 'neutral',
  READY: 'success',
  REVIEW_NEEDED: 'warning',
} as const;

function titleCase(value: string) {
  return value
    .replaceAll('_', ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

type SelectedPlugin = {
  id: string;
  label: string;
  vertical: PluginMarketplaceVertical;
  packageType: PluginMarketplacePackageType;
};

export function PluginMarketplaceWorkbench() {
  const [marketplaceName, setMarketplaceName] = useState('NovaERP Vertical Marketplace');
  const [installScope, setInstallScope] = useState<PluginMarketplaceInstallScope>('TENANT');
  const [plugins, setPlugins] = useState<SelectedPlugin[]>([]);

  const foundationQuery = useQuery({
    queryKey: ['plugin-marketplace-foundation'],
    queryFn: () => platformApi.getPluginMarketplace(),
    staleTime: 60_000,
  });

  const previewMutation = useMutation({
    mutationFn: async () =>
      platformApi.previewPluginMarketplace({
        marketplaceName,
        installScope,
        plugins,
      }),
  });

  const preview = previewMutation.data?.data;

  const togglePlugin = (plugin: SelectedPlugin) => {
    setPlugins((current) =>
      current.some((item) => item.id === plugin.id)
        ? current.filter((item) => item.id !== plugin.id)
        : [...current, plugin],
    );
  };

  const loadStarterPack = () => {
    const starters = foundationQuery.data?.data.starterPlugins ?? [];
    setPlugins(
      starters
        .filter((plugin) => ['POS', 'RESTAURANT', 'LAUNDRY'].includes(plugin.vertical))
        .map((plugin) => ({
          id: plugin.id,
          label: plugin.label,
          vertical: plugin.vertical,
          packageType: plugin.packageType,
        })),
    );
  };

  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
              Sprint 15B / Plugin Marketplace
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Siapkan marketplace plugin eksternal dengan install satu klik yang tetap tergovern
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">One Click Install</StatusBadge>
            <StatusBadge tone="success">External Developers</StatusBadge>
            <StatusBadge tone="success">Vertical Apps</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Workbench ini menyiapkan marketplace untuk plugin buatan developer luar seperti POS,
          hotel, hospital, school, restaurant, laundry, rental, gym, salon, dan clinic. NovaERP
          tetap memegang review manifest, permission, dan audit sebelum paket dipasang ke tenant.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Marketplace Setup</p>
              <h3 className="text-xl font-semibold">Name, scope, and curated starter pack</h3>
            </div>
            <StatusBadge tone="neutral">{plugins.length} plugins selected</StatusBadge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="font-medium">Marketplace name</span>
              <input
                value={marketplaceName}
                onChange={(event) => setMarketplaceName(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Install scope</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={installScope}
                onChange={(event) =>
                  setInstallScope(event.target.value as PluginMarketplaceInstallScope)
                }
              >
                {(foundationQuery.data?.data.installScopes ?? ['TENANT']).map((scope) => (
                  <option key={scope} value={scope}>
                    {titleCase(scope)}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={loadStarterPack}
                className="w-full rounded-2xl border px-4 py-3 text-sm font-semibold"
              >
                Load frontline starter pack
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(foundationQuery.data?.data.reviewStages ?? []).map((stage) => (
              <div
                key={stage}
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950/70"
              >
                {stage}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => previewMutation.mutate()}
            disabled={plugins.length === 0 || previewMutation.isPending}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
          >
            {previewMutation.isPending
              ? 'Preparing one-click rollout...'
              : 'Preview plugin marketplace'}
          </button>

          {previewMutation.isError ? (
            <p className="text-sm text-rose-600">{previewMutation.error.message}</p>
          ) : null}
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Curated Catalog</p>
              <h3 className="text-xl font-semibold">
                Choose the vertical plugins that should be installable
              </h3>
            </div>
            <StatusBadge tone="neutral">
              {foundationQuery.data?.data.starterPlugins.length ?? 5} curated starters
            </StatusBadge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(foundationQuery.data?.data.starterPlugins ?? []).map((plugin) => {
              const selected = plugins.some((item) => item.id === plugin.id);

              return (
                <button
                  key={plugin.id}
                  type="button"
                  onClick={() =>
                    togglePlugin({
                      id: plugin.id,
                      label: plugin.label,
                      vertical: plugin.vertical,
                      packageType: plugin.packageType,
                    })
                  }
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    selected
                      ? 'border-amber-400 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100'
                      : 'border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-950/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{plugin.label}</p>
                    <StatusBadge tone="neutral">{plugin.vertical}</StatusBadge>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted">
                    {titleCase(plugin.packageType)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">{plugin.summary}</p>
                </button>
              );
            })}
          </div>
        </SurfaceCard>
      </div>

      {preview ? (
        <>
          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Install Preview</p>
                  <h3 className="text-xl font-semibold">
                    Outcome for the current one-click marketplace selection
                  </h3>
                </div>
                <StatusBadge tone={statusToneMap[preview.status]}>
                  {preview.status.replaceAll('_', ' ')}
                </StatusBadge>
              </div>

              <p className="text-sm leading-7 text-muted">{preview.summary}</p>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ['Scope', titleCase(preview.installScope)],
                  ['Plugins', `${preview.pluginCount} packages`],
                  ['Launch date', preview.oneClickLaunchDate],
                  ['Install estimate', `${preview.installEstimateMinutes} minutes`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
                    <p className="mt-1 text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Selected Plugins</p>
                  <h3 className="text-xl font-semibold">
                    Vertical packages ready for one-click rollout
                  </h3>
                </div>
                <StatusBadge tone="neutral">{preview.plugins.length} plugins</StatusBadge>
              </div>

              <div className="grid gap-3">
                {preview.plugins.map((plugin) => (
                  <div
                    key={plugin.id}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{plugin.label}</p>
                      <StatusBadge tone="neutral">{plugin.vertical}</StatusBadge>
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted">
                      {titleCase(plugin.packageType)} • {plugin.installTarget}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">{plugin.oneClickAction}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted">
                      {plugin.postInstallRoute}
                    </p>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Install Plan</p>
                  <h3 className="text-xl font-semibold">Rollout sequence before publish</h3>
                </div>
                <StatusBadge tone="neutral">{preview.installPlan.length} steps</StatusBadge>
              </div>
              <div className="grid gap-3">
                {preview.installPlan.map((step) => (
                  <div
                    key={step}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm leading-6 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">
                    Permission Bundles
                  </p>
                  <h3 className="text-xl font-semibold">What stays constrained after install</h3>
                </div>
                <StatusBadge tone="neutral">{preview.permissionBundles.length} bundles</StatusBadge>
              </div>
              <div className="grid gap-3">
                {preview.permissionBundles.map((bundle) => (
                  <div
                    key={bundle}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm leading-6 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    {bundle}
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">
                    Developer Checklist
                  </p>
                  <h3 className="text-xl font-semibold">Requirements before app goes public</h3>
                </div>
                <StatusBadge tone="neutral">{preview.developerChecklist.length} items</StatusBadge>
              </div>
              <div className="grid gap-3">
                {preview.developerChecklist.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm leading-6 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>
        </>
      ) : null}
    </div>
  );
}
