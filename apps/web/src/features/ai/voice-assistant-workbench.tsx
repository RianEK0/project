'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';

import { aiApi } from '@/services/api/ai';

const executionToneMap = {
  DRAFT_CREATED: 'success',
  CONFIRMATION_REQUIRED: 'warning',
  ROUTED_TO_WORKSPACE: 'neutral',
} as const;

export function VoiceAssistantWorkbench() {
  const [transcript, setTranscript] = useState(
    'Buat Purchase Order untuk Supplier ABC sebanyak 50 unit',
  );

  const foundationQuery = useQuery({
    queryKey: ['ai-voice-foundation'],
    queryFn: () => aiApi.getAiVoice(),
    staleTime: 60_000,
  });

  const previewMutation = useMutation({
    mutationFn: async () => aiApi.previewAiVoiceExecution(transcript),
  });

  const preview = previewMutation.data?.data;

  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-700 dark:text-slate-300">
              Sprint 14B / AI Voice
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Ubah perintah lisan menjadi draft aksi ERP yang terarah dan tetap terjaga
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Speech to Action</StatusBadge>
            <StatusBadge tone="success">Guarded Drafts</StatusBadge>
            <StatusBadge tone="success">Cross-domain Routing</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          AI Voice menyiapkan permukaan untuk perintah lisan seperti membuat purchase order,
          purchase request, cek stok, atau mencari invoice. Pada sprint ini, workbench memproses
          transcript hasil speech-to-text lalu mengubahnya menjadi preview aksi yang siap ditinjau.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Voice Command</p>
              <h3 className="text-xl font-semibold">
                Simulate the transcript from a spoken command
              </h3>
            </div>
            <StatusBadge tone="neutral">
              {foundationQuery.data?.data.sampleCommands.length ?? 4} samples
            </StatusBadge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(foundationQuery.data?.data.sampleCommands ?? []).map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setTranscript(sample)}
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-left text-sm transition hover:border-slate-400 dark:border-slate-800 dark:bg-slate-950/70"
              >
                {sample}
              </button>
            ))}
          </div>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Speech transcript</span>
            <textarea
              className="min-h-36 rounded-2xl border bg-transparent px-4 py-3"
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
            />
          </label>

          <button
            type="button"
            onClick={() => previewMutation.mutate()}
            disabled={previewMutation.isPending}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
          >
            {previewMutation.isPending ? 'Interpreting voice command...' : 'Run AI Voice preview'}
          </button>

          {previewMutation.isError ? (
            <p className="text-sm text-rose-600">{previewMutation.error.message}</p>
          ) : null}
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Execution Contract</p>
              <h3 className="text-xl font-semibold">
                Supported intents, confirmation modes, and domain coverage
              </h3>
            </div>
            <StatusBadge tone="neutral">
              {foundationQuery.data?.data.intentTypes.length ?? 4} intents
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

          <div className="grid gap-3 md:grid-cols-2">
            {(foundationQuery.data?.data.confirmationModes ?? []).map((mode) => (
              <div
                key={mode}
                className="rounded-2xl border border-slate-200/80 px-4 py-3 text-sm font-medium dark:border-slate-800"
              >
                {mode.replaceAll('_', ' ')}
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      {preview ? (
        <>
          <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">
                    Execution Preview
                  </p>
                  <h3 className="text-xl font-semibold">
                    How AI Voice interpreted the spoken request
                  </h3>
                </div>
                <StatusBadge tone={executionToneMap[preview.executionStatus]}>
                  {preview.executionStatus.replaceAll('_', ' ')}
                </StatusBadge>
              </div>

              <p className="text-sm leading-7 text-muted">{preview.summary}</p>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ['Intent', preview.intentType.replaceAll('_', ' ')],
                  ['Target route', preview.targetRoute],
                  ['Record', preview.generatedRecordNumber],
                  ['Confirmation', preview.confirmationMode.replaceAll('_', ' ')],
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

              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-sm leading-6 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                <p className="text-xs uppercase tracking-[0.16em] text-muted">Spoken Response</p>
                <p className="mt-1">{preview.spokenResponse}</p>
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">
                    Extracted Parameters
                  </p>
                  <h3 className="text-xl font-semibold">
                    Structured fields prepared from the transcript
                  </h3>
                </div>
                <StatusBadge tone="neutral">
                  {preview.extractedParameters.length} fields
                </StatusBadge>
              </div>

              <div className="grid gap-3">
                {preview.extractedParameters.map((field) => (
                  <div
                    key={field.label}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">{field.label}</p>
                    <p className="mt-1 text-sm font-medium">{field.value}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>

          <SurfaceCard className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Next Actions</p>
                <h3 className="text-xl font-semibold">
                  What the operator or reviewer should do next
                </h3>
              </div>
              <StatusBadge tone="neutral">{preview.nextActions.length} actions</StatusBadge>
            </div>

            <div className="grid gap-3">
              {preview.nextActions.map((action) => (
                <div
                  key={action}
                  className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm leading-6 dark:border-slate-800 dark:bg-slate-950/70"
                >
                  {action}
                </div>
              ))}
            </div>
          </SurfaceCard>
        </>
      ) : null}
    </div>
  );
}
