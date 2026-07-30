'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import { type ReportBuilderJoinType, type ReportBuilderBlockType } from '@nova/shared-types';

import { analyticsApi } from '@/services/api/analytics';

type ReportStageSlot = {
  id: string;
  label: string;
  block: ReportBuilderBlockType | null;
};

const statusToneMap = {
  DRAFT: 'neutral',
  READY: 'success',
  REVIEW_NEEDED: 'warning',
} as const;

const stageSlotsTemplate: ReportStageSlot[] = [
  { id: 'stage-1', label: 'Stage 1', block: null },
  { id: 'stage-2', label: 'Stage 2', block: null },
  { id: 'stage-3', label: 'Stage 3', block: null },
  { id: 'stage-4', label: 'Stage 4', block: null },
  { id: 'stage-5', label: 'Stage 5', block: null },
  { id: 'stage-6', label: 'Stage 6', block: null },
];

function titleCase(value: string) {
  return value
    .replaceAll('_', ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function parseBlockPayload(payload: string): ReportBuilderBlockType | null {
  try {
    const parsed = JSON.parse(payload) as { type?: ReportBuilderBlockType };
    return parsed.type ?? null;
  } catch {
    return null;
  }
}

export function ReportBuilderWorkbench() {
  const [reportName, setReportName] = useState('Purchase Aging Watch');
  const [dataset, setDataset] = useState('Purchase Orders');
  const [joinType, setJoinType] = useState<ReportBuilderJoinType>('LEFT');
  const [slots, setSlots] = useState<ReportStageSlot[]>(stageSlotsTemplate);

  const foundationQuery = useQuery({
    queryKey: ['report-builder-foundation'],
    queryFn: () => analyticsApi.getReportBuilder(),
    staleTime: 60_000,
  });

  const previewMutation = useMutation({
    mutationFn: async () =>
      analyticsApi.previewReport({
        reportName,
        dataset,
        joinType,
        blocks: slots
          .filter((slot) => slot.block)
          .map((slot) => ({
            id: slot.id,
            type: slot.block!,
          })),
      }),
  });

  const preview = previewMutation.data?.data;
  const filledSlotCount = slots.filter((slot) => slot.block).length;

  const handleDrop = (slotId: string, payload: string) => {
    const type = parseBlockPayload(payload);

    if (!type) {
      return;
    }

    setSlots((current) =>
      current.map((slot) => (slot.id === slotId ? { ...slot, block: type } : slot)),
    );
  };

  const loadStarterPipeline = () => {
    const blocks = ['SELECT', 'FILTER', 'GROUP', 'SORT', 'JOIN', 'EXPORT'] as const;

    setSlots((current) =>
      current.map((slot, index) => ({
        ...slot,
        block: blocks[index] ?? null,
      })),
    );
  };

  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">
              Sprint 12D / Report Builder
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Click-built report builder untuk select, filter, group, sort, join, dan export
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">No SQL UI</StatusBadge>
            <StatusBadge tone="success">Drag + Drop Stages</StatusBadge>
            <StatusBadge tone="success">Export Ready</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Workbench ini menyiapkan report builder tanpa coding. User cukup memilih dataset,
          meletakkan stage query ke pipeline, lalu NovaERP mengembalikan preview SQL, kolom output,
          guardrail export, dan jadwal rekomendasi report.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Report Setup</p>
              <h3 className="text-xl font-semibold">Name, dataset, and join policy</h3>
            </div>
            <StatusBadge tone="neutral">{filledSlotCount} stages</StatusBadge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm md:col-span-2">
              <span className="font-medium">Report name</span>
              <input
                value={reportName}
                onChange={(event) => setReportName(event.target.value)}
                className="rounded-2xl border bg-transparent px-4 py-3"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Dataset</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={dataset}
                onChange={(event) => setDataset(event.target.value)}
              >
                {(foundationQuery.data?.data.datasets ?? ['Purchase Orders']).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Join type</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={joinType}
                onChange={(event) => setJoinType(event.target.value as ReportBuilderJoinType)}
              >
                {(foundationQuery.data?.data.joinTypes ?? ['LEFT']).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950/70">
            Starter columns: {(foundationQuery.data?.data.starterColumns ?? []).join(', ')}
          </div>

          <button
            type="button"
            onClick={loadStarterPipeline}
            className="rounded-2xl border px-4 py-3 text-sm font-semibold"
          >
            Load full pipeline
          </button>
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Stage Palette</p>
              <h3 className="text-xl font-semibold">Drag query stages into the pipeline</h3>
            </div>
            <StatusBadge tone="neutral">
              {foundationQuery.data?.data.blockTypes.length ?? 6} stages
            </StatusBadge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(foundationQuery.data?.data.blockTypes ?? []).map((blockType) => (
              <button
                key={blockType}
                type="button"
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData('text/plain', JSON.stringify({ type: blockType }))
                }
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-left transition hover:border-sky-300 hover:bg-sky-50/70 dark:border-slate-800 dark:bg-slate-950/70 dark:hover:border-sky-900"
              >
                <p className="text-sm font-semibold">{titleCase(blockType)}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">Stage block</p>
              </button>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">Pipeline Canvas</p>
            <h3 className="text-xl font-semibold">Drop blocks from left to right</h3>
          </div>
          <button
            type="button"
            onClick={() => previewMutation.mutate()}
            disabled={filledSlotCount === 0 || previewMutation.isPending}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
          >
            {previewMutation.isPending ? 'Building report preview...' : 'Preview report'}
          </button>
        </div>

        <div className="grid gap-3 xl:grid-cols-6">
          {slots.map((slot) => (
            <div
              key={slot.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleDrop(slot.id, event.dataTransfer.getData('text/plain'));
              }}
              className="min-h-[132px] rounded-3xl border border-dashed border-slate-300/80 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/50"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{slot.label}</p>
                {slot.block ? (
                  <button
                    type="button"
                    onClick={() =>
                      setSlots((current) =>
                        current.map((currentSlot) =>
                          currentSlot.id === slot.id
                            ? { ...currentSlot, block: null }
                            : currentSlot,
                        ),
                      )
                    }
                    className="text-xs font-medium text-rose-600"
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-6 text-center text-sm dark:border-slate-800 dark:bg-slate-950/90">
                {slot.block ? titleCase(slot.block) : 'Drop stage'}
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
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Preview Summary</p>
                  <h3 className="text-xl font-semibold">{preview.reportName}</h3>
                </div>
                <StatusBadge tone={statusToneMap[preview.status]}>
                  {titleCase(preview.status)}
                </StatusBadge>
              </div>

              <p className="text-sm leading-7 text-muted">{preview.summary}</p>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  ['Dataset', preview.dataset],
                  ['Blocks', String(preview.blockCount)],
                  ['Estimated rows', preview.estimatedRows.toLocaleString('en-US')],
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
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Output</p>
                <h3 className="text-xl font-semibold">Columns and export readiness</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {preview.outputColumns.map((column) => (
                  <StatusBadge key={column} tone="neutral">
                    {column}
                  </StatusBadge>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {preview.exportFormats.map((format) => (
                  <StatusBadge key={format} tone="success">
                    {format}
                  </StatusBadge>
                ))}
              </div>

              <div className="rounded-2xl border border-sky-200/80 bg-sky-50/70 px-4 py-3 text-sm dark:border-sky-900/60 dark:bg-sky-950/30">
                Recommended schedule date:{' '}
                <span className="font-semibold">{preview.recommendedScheduleDate}</span>
              </div>
            </SurfaceCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">SQL Preview</p>
                <h3 className="text-xl font-semibold">Generated query outline</h3>
              </div>

              <pre className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-950 px-4 py-4 text-sm text-slate-100 dark:border-slate-800">
                {preview.sqlPreview}
              </pre>

              <div className="grid gap-3">
                {preview.stages.map((stage, index) => (
                  <div
                    key={`${stage.type}-${index}`}
                    className="rounded-2xl border border-slate-200/80 px-4 py-3 dark:border-slate-800"
                  >
                    <p className="text-sm font-semibold">{titleCase(stage.type)}</p>
                    <p className="mt-1 text-sm text-muted">{stage.summary}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Guardrails</p>
                <h3 className="text-xl font-semibold">What stays governed in self-serve mode</h3>
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
