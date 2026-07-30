'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import {
  type DashboardAudience,
  type DashboardBuilderLayoutMode,
  type DashboardBuilderRefreshCadence,
  type DashboardBuilderWidgetType,
  type DashboardSignalTone,
} from '@nova/shared-types';

import { dashboardsApi } from '@/services/api/dashboards';

type DashboardPaletteItem = {
  id: string;
  type: DashboardBuilderWidgetType;
  title: string;
};

type DashboardCanvasSlot = {
  id: string;
  label: string;
  item: DashboardPaletteItem | null;
};

const statusToneMap = {
  DRAFT: 'neutral',
  READY: 'success',
  REVIEW_NEEDED: 'warning',
} as const;

const toneMap: Record<DashboardSignalTone, 'success' | 'warning' | 'danger'> = {
  HEALTHY: 'success',
  WATCH: 'warning',
  AT_RISK: 'danger',
  CRITICAL: 'danger',
};

const initialSlots: DashboardCanvasSlot[] = [
  { id: 'hero', label: 'Hero', item: null },
  { id: 'top-row', label: 'Top Row', item: null },
  { id: 'mid-row', label: 'Mid Row', item: null },
  { id: 'bottom-row', label: 'Bottom Row', item: null },
];

function titleCase(value: string) {
  return value
    .replaceAll('_', ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function parsePaletteItem(payload: string): DashboardPaletteItem | null {
  try {
    const parsed = JSON.parse(payload) as DashboardPaletteItem;

    if (!parsed.id || !parsed.type || !parsed.title) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function DashboardBuilderWorkbench() {
  const [dashboardName, setDashboardName] = useState('Operations Pulse');
  const [audience, setAudience] = useState<DashboardAudience>('WAREHOUSE');
  const [layoutMode, setLayoutMode] = useState<DashboardBuilderLayoutMode>('OPS_WALL');
  const [refreshCadence, setRefreshCadence] = useState<DashboardBuilderRefreshCadence>('LIVE');
  const [slots, setSlots] = useState<DashboardCanvasSlot[]>(initialSlots);

  const foundationQuery = useQuery({
    queryKey: ['dashboard-builder-foundation'],
    queryFn: () => dashboardsApi.getDashboardBuilder(),
    staleTime: 60_000,
  });

  const previewMutation = useMutation({
    mutationFn: async () =>
      dashboardsApi.previewDashboardBuilder({
        dashboardName,
        audience,
        layoutMode,
        refreshCadence,
        widgets: slots
          .filter((slot) => slot.item)
          .map((slot) => ({
            id: slot.item!.id,
            type: slot.item!.type,
            slot: slot.label,
            title: slot.item!.title,
          })),
      }),
  });

  const preview = previewMutation.data?.data;
  const paletteItems =
    foundationQuery.data?.data.widgetTypes.map((type) => ({
      id: `widget-${type}`.toLowerCase(),
      type,
      title: titleCase(type),
    })) ?? [];

  const handleDrop = (slotId: string, payload: string) => {
    const item = parsePaletteItem(payload);

    if (!item) {
      return;
    }

    setSlots((current) => current.map((slot) => (slot.id === slotId ? { ...slot, item } : slot)));
  };

  const loadStarterBoard = () => {
    const starters = foundationQuery.data?.data.starterWidgets ?? [];

    setSlots((current) =>
      current.map((slot, index) => {
        const starter = starters[index];

        return starter
          ? {
              ...slot,
              item: {
                id: `starter-${starter.type}-${index + 1}`,
                type: starter.type,
                title: starter.title,
              },
            }
          : slot;
      }),
    );
  };

  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-indigo-700 dark:text-indigo-300">
              Sprint 13B / Dashboard Builder
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Self-serve dashboard builder untuk chart, metric, card, gauge, map, timeline,
              calendar, dan kanban
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">User-built Boards</StatusBadge>
            <StatusBadge tone="success">Drag + Drop Widgets</StatusBadge>
            <StatusBadge tone="success">Dashboards Workspace</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Workbench ini memisahkan board operational builder dari BI builder Sprint 12. Di sini user
          menyusun dashboard kerjanya sendiri dengan widget operasional yang lebih action-oriented,
          lalu NovaERP memberi preview publish, sharing target, refresh cadence, dan guardrail
          sebelum dashboard dipasang di workspace.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Board Setup</p>
              <h3 className="text-xl font-semibold">Audience, layout, and cadence</h3>
            </div>
            <StatusBadge tone="neutral">
              {slots.filter((slot) => slot.item).length} widgets
            </StatusBadge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="font-medium">Dashboard name</span>
              <input
                value={dashboardName}
                onChange={(event) => setDashboardName(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Audience</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={audience}
                onChange={(event) => setAudience(event.target.value as DashboardAudience)}
              >
                {(foundationQuery.data?.data.audiences ?? ['EXECUTIVE']).map((item) => (
                  <option key={item} value={item}>
                    {titleCase(item)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Layout mode</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={layoutMode}
                onChange={(event) =>
                  setLayoutMode(event.target.value as DashboardBuilderLayoutMode)
                }
              >
                {(foundationQuery.data?.data.layoutModes ?? ['GRID']).map((item) => (
                  <option key={item} value={item}>
                    {titleCase(item)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="font-medium">Refresh cadence</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={refreshCadence}
                onChange={(event) =>
                  setRefreshCadence(event.target.value as DashboardBuilderRefreshCadence)
                }
              >
                {(foundationQuery.data?.data.refreshCadences ?? ['HOURLY']).map((item) => (
                  <option key={item} value={item}>
                    {titleCase(item)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={loadStarterBoard}
            className="rounded-2xl border px-4 py-3 text-sm font-semibold"
          >
            Load starter dashboard
          </button>
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Widget Palette</p>
              <h3 className="text-xl font-semibold">Drag widgets onto the board</h3>
            </div>
            <StatusBadge tone="neutral">{paletteItems.length} widgets</StatusBadge>
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
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/70 dark:border-slate-800 dark:bg-slate-950/70 dark:hover:border-indigo-900"
              >
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">{item.type}</p>
              </button>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">Board Canvas</p>
            <h3 className="text-xl font-semibold">Drop one widget into each slot</h3>
          </div>
          <button
            type="button"
            onClick={() => previewMutation.mutate()}
            disabled={slots.every((slot) => !slot.item) || previewMutation.isPending}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
          >
            {previewMutation.isPending ? 'Preparing dashboard preview...' : 'Preview dashboard'}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {slots.map((slot) => (
            <div
              key={slot.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleDrop(slot.id, event.dataTransfer.getData('text/plain'));
              }}
              className="min-h-[180px] rounded-3xl border border-dashed border-slate-300/80 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/50"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{slot.label}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">{slot.id}</p>
                </div>
                {slot.item ? (
                  <button
                    type="button"
                    onClick={() =>
                      setSlots((current) =>
                        current.map((currentSlot) =>
                          currentSlot.id === slot.id ? { ...currentSlot, item: null } : currentSlot,
                        ),
                      )
                    }
                    className="text-xs font-medium text-rose-600"
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-6 text-sm dark:border-slate-800 dark:bg-slate-950/90">
                {slot.item ? (
                  <>
                    <p className="font-semibold">{slot.item.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                      {titleCase(slot.item.type)}
                    </p>
                  </>
                ) : (
                  <p className="text-muted">Drop widget here</p>
                )}
              </div>
            </div>
          ))}
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
                  <h3 className="text-xl font-semibold">{preview.dashboardName}</h3>
                </div>
                <StatusBadge tone={statusToneMap[preview.status]}>
                  {titleCase(preview.status)}
                </StatusBadge>
              </div>

              <p className="text-sm leading-7 text-muted">{preview.summary}</p>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  ['Audience', titleCase(preview.audience)],
                  ['Cadence', titleCase(preview.refreshCadence)],
                  ['Publish date', preview.nextPublishDate],
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
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Distribution</p>
                <h3 className="text-xl font-semibold">Sharing and operational focus</h3>
              </div>

              <div className="grid gap-3">
                {preview.shareTargets.map((target) => (
                  <div
                    key={target}
                    className="rounded-2xl border border-sky-200/80 bg-sky-50/70 px-4 py-3 text-sm dark:border-sky-900/60 dark:bg-sky-950/30"
                  >
                    {target}
                  </div>
                ))}
              </div>

              <div className="grid gap-3">
                {preview.operationalFocus.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200/80 px-4 py-3 text-sm dark:border-slate-800"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Widget Narrative</p>
                <h3 className="text-xl font-semibold">What each widget contributes</h3>
              </div>

              <div className="grid gap-3">
                {preview.widgets.map((widget) => (
                  <div
                    key={widget.id}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{widget.title}</p>
                      <StatusBadge tone={toneMap[widget.signalTone]}>
                        {titleCase(widget.signalTone)}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                      {titleCase(widget.type)} • {widget.slot}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">{widget.insight}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Guardrails</p>
                <h3 className="text-xl font-semibold">What stays governed before publish</h3>
              </div>

              <div className="grid gap-3">
                {preview.guardrails.map((guardrail) => (
                  <div
                    key={guardrail}
                    className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm dark:border-amber-900/60 dark:bg-amber-950/30"
                  >
                    {guardrail}
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
