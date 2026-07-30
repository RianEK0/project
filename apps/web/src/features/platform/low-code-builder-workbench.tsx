'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import {
  type LowCodeComponentType,
  type LowCodeLayoutMode,
  type LowCodeSurfaceTarget,
} from '@nova/shared-types';

import { platformApi } from '@/services/api/platform';

type LowCodePaletteItem = {
  id: string;
  type: LowCodeComponentType;
  label: string;
};

type LowCodeCanvasComponent = {
  id: string;
  type: LowCodeComponentType;
  zone: string;
  label: string;
};

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

function parsePaletteItem(payload: string): LowCodePaletteItem | null {
  try {
    const parsed = JSON.parse(payload) as LowCodePaletteItem;

    if (!parsed.id || !parsed.type || !parsed.label) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function LowCodeBuilderWorkbench() {
  const [appName, setAppName] = useState('Procurement Ops Console');
  const [layoutMode, setLayoutMode] = useState<LowCodeLayoutMode>('MASTER_DETAIL');
  const [surfaceTarget, setSurfaceTarget] = useState<LowCodeSurfaceTarget>('DESKTOP');
  const [components, setComponents] = useState<LowCodeCanvasComponent[]>([]);

  const foundationQuery = useQuery({
    queryKey: ['low-code-builder-foundation'],
    queryFn: () => platformApi.getLowCodeBuilder(),
    staleTime: 60_000,
  });

  const previewMutation = useMutation({
    mutationFn: async () =>
      platformApi.previewLowCodeBuilder({
        appName,
        layoutMode,
        surfaceTarget,
        components: components.map((component) => ({
          id: component.id,
          type: component.type,
          zone: component.zone,
          label: component.label,
        })),
      }),
  });

  const preview = previewMutation.data?.data;
  const zones = foundationQuery.data?.data.supportedZones ?? [];
  const paletteItems =
    foundationQuery.data?.data.componentTypes.map((type) => ({
      id: `component-${type}`.toLowerCase(),
      type,
      label: titleCase(type),
    })) ?? [];

  const handleDrop = (zone: string, payload: string) => {
    const item = parsePaletteItem(payload);

    if (!item) {
      return;
    }

    setComponents((current) => [
      ...current,
      {
        id: `${zone}-${item.id}-${current.length + 1}`,
        type: item.type,
        zone,
        label: item.label,
      },
    ]);
  };

  const loadStarterScreen = () => {
    const starter = foundationQuery.data?.data.starterScreens[0];

    if (!starter) {
      return;
    }

    setSurfaceTarget(starter.targetSurface);
    setComponents(
      starter.recommendedComponents.map((type, index) => ({
        id: `starter-${type}-${index + 1}`,
        type,
        zone: zones[index] ?? 'Workspace',
        label: titleCase(type),
      })),
    );
  };

  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-700 dark:text-slate-300">
              Sprint 13A / Low Code Builder
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Builder aplikasi ala Retool untuk table, button, chart, map, calendar, input, form,
              tree, kanban, dan gallery
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Drag + Drop App</StatusBadge>
            <StatusBadge tone="success">Retool-style</StatusBadge>
            <StatusBadge tone="success">Platform Surface</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Workbench ini membuka lane low-code untuk membuat aplikasi internal dengan komponen visual
          tanpa coding penuh. User cukup menyeret komponen ke canvas, lalu NovaERP mengembalikan
          preview route, domain binding, automation hook, dan guardrail publish sebelum app dibuka
          ke tenant.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">App Setup</p>
              <h3 className="text-xl font-semibold">Name, layout, and surface target</h3>
            </div>
            <StatusBadge tone="neutral">{components.length} components</StatusBadge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="font-medium">App name</span>
              <input
                value={appName}
                onChange={(event) => setAppName(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Layout mode</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={layoutMode}
                onChange={(event) => setLayoutMode(event.target.value as LowCodeLayoutMode)}
              >
                {(foundationQuery.data?.data.layoutModes ?? ['CANVAS']).map((mode) => (
                  <option key={mode} value={mode}>
                    {titleCase(mode)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Surface target</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={surfaceTarget}
                onChange={(event) => setSurfaceTarget(event.target.value as LowCodeSurfaceTarget)}
              >
                {(foundationQuery.data?.data.surfaceTargets ?? ['DESKTOP']).map((target) => (
                  <option key={target} value={target}>
                    {titleCase(target)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {(foundationQuery.data?.data.connectedDomains ?? []).map((domain) => (
              <StatusBadge key={domain} tone="neutral">
                {domain}
              </StatusBadge>
            ))}
          </div>

          <button
            type="button"
            onClick={loadStarterScreen}
            className="rounded-2xl border px-4 py-3 text-sm font-semibold"
          >
            Load procurement starter screen
          </button>
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Component Palette</p>
              <h3 className="text-xl font-semibold">Drag components into zones</h3>
            </div>
            <StatusBadge tone="neutral">{paletteItems.length} components</StatusBadge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {paletteItems.map((item) => (
              <button
                key={item.id}
                type="button"
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData('text/plain', JSON.stringify(item))
                }
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-left transition hover:border-slate-400 hover:bg-slate-100/70 dark:border-slate-800 dark:bg-slate-950/70 dark:hover:border-slate-700"
              >
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">{item.type}</p>
              </button>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">Canvas</p>
            <h3 className="text-xl font-semibold">Drop components into app zones</h3>
          </div>
          <button
            type="button"
            onClick={() => previewMutation.mutate()}
            disabled={components.length === 0 || previewMutation.isPending}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
          >
            {previewMutation.isPending ? 'Preparing app preview...' : 'Preview low-code app'}
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          {zones.map((zone) => {
            const zoneComponents = components.filter((component) => component.zone === zone);

            return (
              <div
                key={zone}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  handleDrop(zone, event.dataTransfer.getData('text/plain'));
                }}
                className="min-h-[220px] rounded-3xl border border-dashed border-slate-300/80 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/50"
              >
                <p className="text-sm font-semibold">{zone}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                  {zoneComponents.length} components
                </p>

                <div className="mt-4 grid gap-3">
                  {zoneComponents.length > 0 ? (
                    zoneComponents.map((component) => (
                      <div
                        key={component.id}
                        className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/90"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{component.label}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                              {titleCase(component.type)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setComponents((current) =>
                                current.filter((item) => item.id !== component.id),
                              )
                            }
                            className="text-xs font-medium text-rose-600"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-6 text-sm text-muted dark:border-slate-800 dark:bg-slate-950/90">
                      Drop components here
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {previewMutation.isError ? (
          <p className="text-sm text-rose-600">{previewMutation.error.message}</p>
        ) : null}
      </SurfaceCard>

      {preview ? (
        <>
          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Publish Preview</p>
                  <h3 className="text-xl font-semibold">{preview.appName}</h3>
                </div>
                <StatusBadge tone={statusToneMap[preview.status]}>
                  {titleCase(preview.status)}
                </StatusBadge>
              </div>

              <p className="text-sm leading-7 text-muted">{preview.summary}</p>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  ['Layout', titleCase(preview.layoutMode)],
                  ['Surface', titleCase(preview.surfaceTarget)],
                  ['Publish date', preview.publishReadinessDate],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
                    <p className="mt-1 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Generated Routes</p>
                <h3 className="text-xl font-semibold">What the app would expose</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {preview.generatedRoutes.map((route) => (
                  <StatusBadge key={route} tone="success">
                    {route}
                  </StatusBadge>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {preview.connectedDomains.map((domain) => (
                  <StatusBadge key={domain} tone="neutral">
                    {domain}
                  </StatusBadge>
                ))}
              </div>
            </SurfaceCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">
                  Component Narrative
                </p>
                <h3 className="text-xl font-semibold">How each component behaves</h3>
              </div>

              <div className="grid gap-3">
                {preview.components.map((component) => (
                  <div
                    key={component.id}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <p className="text-sm font-semibold">{component.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                      {titleCase(component.type)} • {component.zone}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">{component.behavior}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted">
                      {component.queryBinding}
                    </p>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Governance</p>
                <h3 className="text-xl font-semibold">Hooks and publish checks</h3>
              </div>

              <div className="grid gap-3">
                {preview.automationHooks.map((hook) => (
                  <div
                    key={hook}
                    className="rounded-2xl border border-sky-200/80 bg-sky-50/70 px-4 py-3 text-sm dark:border-sky-900/60 dark:bg-sky-950/30"
                  >
                    {hook}
                  </div>
                ))}
              </div>

              <div className="grid gap-3">
                {preview.governanceChecks.map((check) => (
                  <div
                    key={check}
                    className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm dark:border-amber-900/60 dark:bg-amber-950/30"
                  >
                    {check}
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
