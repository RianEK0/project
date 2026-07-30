'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';

import { aiApi } from '@/services/api/ai';

const executionToneMap = {
  SAFE_QUERY_READY: 'success',
  DRAFT_ACTION_READY: 'warning',
  REVIEW_NEEDED: 'danger',
} as const;

export function AiCopilotWorkbench() {
  const [prompt, setPrompt] = useState('Buat laporan penjualan bulan lalu.');

  const foundationQuery = useQuery({
    queryKey: ['ai-copilot-foundation'],
    queryFn: () => aiApi.getAiCopilot(),
    staleTime: 60_000,
  });

  const previewMutation = useMutation({
    mutationFn: async () => aiApi.previewAiCopilot(prompt),
  });

  const preview = previewMutation.data?.data;
  const maxChartValue = Math.max(...(preview?.chartPoints.map((point) => point.value) ?? [1]));

  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-4 rounded-[34px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1.5">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-700 dark:text-cyan-300">
              Sprint 19 / AI Copilot
            </p>
            <h2 className="font-display text-3xl font-semibold">Tanya dengan bahasa biasa, jawab dengan jelas</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Safe Query</StatusBadge>
            <StatusBadge tone="success">Tabel & Grafik</StatusBadge>
            <StatusBadge tone="success">Ekspor</StatusBadge>
          </div>
        </div>

        <p className="max-w-2xl text-sm leading-6 text-muted">
          Copilot menjawab dengan bahasa yang lebih sederhana, tetap informatif, dan selalu memberi
          arah langkah berikutnya.
        </p>
      </SurfaceCard>

      <div className="grid gap-3 md:grid-cols-3">
        {(foundationQuery.data?.data.responsePrinciples ?? []).map((item) => (
          <SurfaceCard key={item} className="rounded-[28px] px-5 py-4">
            <p className="text-sm leading-6 text-muted">{item}</p>
          </SurfaceCard>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <SurfaceCard className="space-y-4 rounded-[30px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Pertanyaan</p>
              <h3 className="text-xl font-semibold">Coba pertanyaan seperti user</h3>
            </div>
            <StatusBadge tone="neutral">
              {foundationQuery.data?.data.samplePrompts.length ?? 4} contoh
            </StatusBadge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(foundationQuery.data?.data.samplePrompts ?? []).map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setPrompt(sample)}
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-left text-sm transition hover:border-cyan-300 dark:border-slate-800 dark:bg-slate-950/70"
              >
                {sample}
              </button>
            ))}
          </div>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Prompt</span>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="min-h-40 rounded-2xl border bg-transparent px-4 py-3"
            />
          </label>

          <button
            type="button"
            onClick={() => previewMutation.mutate()}
            disabled={previewMutation.isPending}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
          >
            {previewMutation.isPending ? 'AI sedang memproses...' : 'Jalankan preview AI'}
          </button>

          {previewMutation.isError ? (
            <p className="text-sm text-rose-600">{previewMutation.error.message}</p>
          ) : null}
        </SurfaceCard>

        <SurfaceCard className="space-y-4 rounded-[30px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Batas aman</p>
              <h3 className="text-xl font-semibold">Apa yang boleh dilakukan AI</h3>
            </div>
            <StatusBadge tone="neutral">
              {foundationQuery.data?.data.guardrails.length ?? 3} aturan
            </StatusBadge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(foundationQuery.data?.data.intentTypes ?? []).map((intent) => (
              <div
                key={intent}
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950/70"
              >
                {intent.replaceAll('_', ' ')}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {(foundationQuery.data?.data.exportFormats ?? []).map((format) => (
              <StatusBadge key={format} tone="neutral">
                {format.replaceAll('_', ' ')}
              </StatusBadge>
            ))}
          </div>

          <div className="grid gap-3">
            {(foundationQuery.data?.data.guardrails ?? []).map((rule) => (
              <div
                key={rule}
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm leading-6 dark:border-slate-800 dark:bg-slate-950/70"
              >
                {rule}
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      {preview ? (
        <>
          <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
            <SurfaceCard className="space-y-4 rounded-[30px]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Jawaban AI</p>
                  <h3 className="text-xl font-semibold">Cara AI memahami pertanyaan Anda</h3>
                </div>
                <StatusBadge tone={executionToneMap[preview.executionStatus]}>
                  {preview.executionStatus.replaceAll('_', ' ')}
                </StatusBadge>
              </div>

              <div className="rounded-3xl border border-cyan-200/80 bg-cyan-50/75 px-5 py-4 dark:border-cyan-900/60 dark:bg-cyan-950/30">
                <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">
                  {preview.summary}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ['Intent', preview.intentType.replaceAll('_', ' ')],
                  ['Domain utama', preview.primaryDomain],
                  ['Periode', preview.coverageWindow],
                  ['Mode AI', preview.modelMode.replaceAll('_', ' ')],
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

              <div className="grid gap-3 md:grid-cols-3">
                {preview.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-cyan-200/80 bg-cyan-50/80 px-4 py-3 dark:border-cyan-900/60 dark:bg-cyan-950/30"
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">{metric.label}</p>
                    <p className="mt-1 text-lg font-semibold">{metric.value}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{metric.note}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4 rounded-[30px]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Data pendukung</p>
                  <h3 className="text-xl font-semibold">Data yang siap ditampilkan AI</h3>
                </div>
                <StatusBadge tone="neutral">{preview.chartPoints.length} titik data</StatusBadge>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">{preview.chartTitle}</p>
                <div className="grid gap-3">
                  {preview.chartPoints.map((point) => (
                    <div key={point.label} className="space-y-1">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span>{point.label}</span>
                        <span className="font-medium">{point.value.toLocaleString('en-US')}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-cyan-500"
                          style={{ width: `${(point.value / maxChartValue) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3">
                {preview.dataRows.map((row) => (
                  <div
                    key={`${row.primary}-${row.secondary}`}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <p className="text-sm font-semibold">{row.primary}</p>
                    <p className="mt-1 text-sm text-muted">{row.secondary}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{row.tertiary}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
            <SurfaceCard className="space-y-4 rounded-[30px]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Rencana aman</p>
                  <h3 className="text-xl font-semibold">Langkah query di balik jawaban AI</h3>
                </div>
                <StatusBadge tone="neutral">{preview.safeQueryPlan.length} langkah</StatusBadge>
              </div>

              <div className="grid gap-3">
                {preview.safeQueryPlan.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm leading-6 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4 rounded-[30px]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Penjelasan</p>
                  <h3 className="text-xl font-semibold">Ringkasan dan langkah lanjut</h3>
                </div>
                <StatusBadge tone="neutral">
                  {preview.suggestedExports.length} mode ekspor
                </StatusBadge>
              </div>

              <div className="grid gap-3">
                {preview.narrative.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm leading-6 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {preview.suggestedExports.map((format) => (
                  <StatusBadge key={format} tone="neutral">
                    {format.replaceAll('_', ' ')}
                  </StatusBadge>
                ))}
              </div>

              <div className="grid gap-3">
                {preview.draftActions.map((action) => (
                  <div
                    key={action.label}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{action.label}</p>
                      <StatusBadge tone="neutral">{action.route}</StatusBadge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">{action.rationale}</p>
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
