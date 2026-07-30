'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import {
  type BiDashboardLayoutMode,
  type BiWidgetType,
  type DashboardTimeWindow,
} from '@nova/shared-types';

import { analyticsApi } from '@/services/api/analytics';

type DashboardPaletteItem = {
  id: string;
  type: BiWidgetType;
  domain: string;
  metric: string;
  label: string;
  aggregation: string;
};

type DashboardCanvasSlot = {
  id: string;
  label: string;
  hint: string;
  item: DashboardPaletteItem | null;
};

const statusToneMap = {
  DRAFT: 'neutral',
  READY: 'success',
  REVIEW_NEEDED: 'warning',
} as const;

const emptySlots: DashboardCanvasSlot[] = [
  { id: 'hero', label: 'Hero Tile', hint: 'Drop a KPI, chart, or forecast tile here.', item: null },
  {
    id: 'left',
    label: 'Left Insight',
    hint: 'Use this lane for pivot or heatmap analysis.',
    item: null,
  },
  {
    id: 'right',
    label: 'Right Insight',
    hint: 'Treemap, map, or chart comparisons fit well here.',
    item: null,
  },
  {
    id: 'bottom',
    label: 'Bottom Detail',
    hint: 'Reserve for supporting operational detail.',
    item: null,
  },
];

function titleCase(value: string) {
  return value
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function parsePalettePayload(payload: string): DashboardPaletteItem | null {
  try {
    const parsed = JSON.parse(payload) as DashboardPaletteItem;

    if (!parsed.id || !parsed.type || !parsed.domain || !parsed.metric) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function BiDashboardBuilderWorkbench() {
  const [title, setTitle] = useState('Executive Self-Serve Dashboard');
  const [layoutMode, setLayoutMode] = useState<BiDashboardLayoutMode>('GRID');
  const [timeWindow, setTimeWindow] = useState<DashboardTimeWindow>('THIS_MONTH');
  const [slots, setSlots] = useState<DashboardCanvasSlot[]>(emptySlots);

  const foundationQuery = useQuery({
    queryKey: ['bi-builder-foundation'],
    queryFn: () => analyticsApi.getBiBuilder(),
    staleTime: 60_000,
  });

  const previewMutation = useMutation({
    mutationFn: async () =>
      analyticsApi.previewBiDashboard({
        title,
        layoutMode,
        timeWindow,
        widgets: slots
          .filter((slot) => slot.item)
          .map((slot) => ({
            id: slot.item!.id,
            type: slot.item!.type,
            domain: slot.item!.domain,
            metric: slot.item!.metric,
          })),
      }),
  });

  const paletteItems =
    foundationQuery.data?.data.starterMetrics.flatMap((metric) =>
      metric.supportedWidgets.map((widgetType) => ({
        id: `${metric.domain}-${metric.label}-${widgetType}`.toLowerCase().replaceAll(' ', '-'),
        type: widgetType,
        domain: metric.domain,
        metric: metric.label,
        label: `${metric.label} / ${titleCase(widgetType)}`,
        aggregation: metric.defaultAggregation,
      })),
    ) ?? [];

  const filledSlotCount = slots.filter((slot) => slot.item).length;
  const preview = previewMutation.data?.data;

  const handleDrop = (slotId: string, rawPayload: string) => {
    const item = parsePalettePayload(rawPayload);

    if (!item) {
      return;
    }

    setSlots((current) => current.map((slot) => (slot.id === slotId ? { ...slot, item } : slot)));
  };

  const loadSuggestedLayout = () => {
    setSlots((current) =>
      current.map((slot, index) => ({
        ...slot,
        item: paletteItems[index] ?? null,
      })),
    );
  };

  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">
              Sprint 12A / BI Builder
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Dashboard builder ala Power BI untuk chart, pivot, heatmap, treemap, map, gauge, dan
              forecast
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Drag + Drop</StatusBadge>
            <StatusBadge tone="success">Self-Serve Dashboard</StatusBadge>
            <StatusBadge tone="success">Analytics Workspace</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Workbench ini memberi user jalur self-serve untuk menyusun dashboard sendiri dari widget
          BI yang sudah dikurasi. Tile bisa di-drag ke canvas, lalu NovaERP menyiapkan preview
          publish, narasi dashboard, dan arah kolaborasi sebelum dashboard dibuka lebih luas.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Dashboard Setup</p>
              <h3 className="text-xl font-semibold">Name, layout, and timeline</h3>
            </div>
            <StatusBadge tone="neutral">{filledSlotCount} tiles on canvas</StatusBadge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="font-medium">Dashboard title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Layout mode</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={layoutMode}
                onChange={(event) => setLayoutMode(event.target.value as BiDashboardLayoutMode)}
              >
                {(foundationQuery.data?.data.layoutModes ?? ['GRID']).map((mode) => (
                  <option key={mode} value={mode}>
                    {titleCase(mode)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Time window</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={timeWindow}
                onChange={(event) => setTimeWindow(event.target.value as DashboardTimeWindow)}
              >
                {(foundationQuery.data?.data.timeWindows ?? ['THIS_MONTH']).map((window) => (
                  <option key={window} value={window}>
                    {titleCase(window)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {(foundationQuery.data?.data.supportedInteractions ?? []).map((interaction) => (
              <StatusBadge key={interaction} tone="neutral">
                {interaction}
              </StatusBadge>
            ))}
          </div>

          <button
            type="button"
            onClick={loadSuggestedLayout}
            className="rounded-2xl border px-4 py-3 text-sm font-semibold"
          >
            Load suggested layout
          </button>
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Palette</p>
              <h3 className="text-xl font-semibold">Drag starter widgets into the dashboard</h3>
            </div>
            <StatusBadge tone="neutral">{paletteItems.length} widget templates</StatusBadge>
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
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-left transition hover:border-sky-300 hover:bg-sky-50/70 dark:border-slate-800 dark:bg-slate-950/70 dark:hover:border-sky-900"
              >
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                  {item.domain} • {item.aggregation}
                </p>
              </button>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">Canvas</p>
            <h3 className="text-xl font-semibold">Drop widgets into dashboard positions</h3>
          </div>
          <button
            type="button"
            onClick={() => previewMutation.mutate()}
            disabled={filledSlotCount === 0 || previewMutation.isPending}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
          >
            {previewMutation.isPending ? 'Preparing BI preview...' : 'Preview dashboard'}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {slots.map((slot) => (
            <div
              key={slot.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleDrop(slot.id, event.dataTransfer.getData('text/plain'));
              }}
              className="min-h-[164px] rounded-3xl border border-dashed border-slate-300/80 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/50"
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

              <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950/90">
                {slot.item ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">{slot.item.label}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">
                      {titleCase(slot.item.type)} • {slot.item.domain}
                    </p>
                    <p className="text-sm text-muted">{slot.item.metric}</p>
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-muted">{slot.hint}</p>
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
                  <h3 className="text-xl font-semibold">{preview.title}</h3>
                </div>
                <StatusBadge tone={statusToneMap[preview.status]}>
                  {titleCase(preview.status)}
                </StatusBadge>
              </div>

              <p className="text-sm leading-7 text-muted">{preview.narrative}</p>

              <div className="grid gap-3 md:grid-cols-3">
                {preview.spotlightStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">{stat.label}</p>
                    <p className="mt-1 text-sm font-semibold">{stat.value}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                      {titleCase(stat.tone)}
                    </p>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Filters</p>
                <h3 className="text-xl font-semibold">Governance applied automatically</h3>
              </div>

              <div className="grid gap-3">
                {preview.filtersApplied.map((filter) => (
                  <div
                    key={filter}
                    className="rounded-2xl border border-slate-200/80 px-4 py-3 text-sm dark:border-slate-800"
                  >
                    {filter}
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-sky-200/80 bg-sky-50/70 px-4 py-3 text-sm dark:border-sky-900/60 dark:bg-sky-950/30">
                Forecast anchor date:{' '}
                <span className="font-semibold">{preview.forecastAnchorDate}</span>
              </div>
            </SurfaceCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Widget Narrative</p>
                <h3 className="text-xl font-semibold">How each tile reads to the business</h3>
              </div>

              <div className="grid gap-3">
                {preview.widgets.map((widget) => (
                  <div
                    key={widget.id}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{widget.title}</p>
                      <StatusBadge tone="neutral">{widget.confidencePct}%</StatusBadge>
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted">
                      {titleCase(widget.type)} • {widget.expectedVisual}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">{widget.insight}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Collaboration</p>
                <h3 className="text-xl font-semibold">Recommended next moves</h3>
              </div>

              <div className="grid gap-3">
                {preview.collaborationTargets.map((target) => (
                  <div
                    key={target}
                    className="rounded-2xl border border-slate-200/80 px-4 py-3 text-sm dark:border-slate-800"
                  >
                    {target}
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
