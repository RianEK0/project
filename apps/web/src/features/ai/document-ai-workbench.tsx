'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import { type AiDocumentReviewType } from '@nova/shared-types';

import { aiApi } from '@/services/api/ai';

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const statusToneMap = {
  DRAFT: 'neutral',
  PENDING_SIGNATURE: 'warning',
  ACTIVE: 'success',
  EXPIRING: 'warning',
  REVIEW_NEEDED: 'danger',
  CLOSED: 'neutral',
} as const;

const riskToneMap = {
  LOW: 'neutral',
  MEDIUM: 'warning',
  HIGH: 'danger',
  CRITICAL: 'danger',
} as const;

export function DocumentAiWorkbench() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<AiDocumentReviewType>('CONTRACT');

  const foundationQuery = useQuery({
    queryKey: ['ai-document-review-foundation'],
    queryFn: () => aiApi.getAiDocumentReview(),
    staleTime: 60_000,
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) {
        throw new Error('Please choose a contract or document file first.');
      }

      return aiApi.analyzeAiDocument(selectedFile, documentType);
    },
  });

  const analysis = reviewMutation.data?.data;

  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-rose-700 dark:text-rose-300">
              Sprint 11D / Document AI
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Upload contract, agreement, NDA, purchase order, atau invoice lalu baca maknanya lebih
              cepat
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Multipart Upload</StatusBadge>
            <StatusBadge tone="success">Summary + Risk</StatusBadge>
            <StatusBadge tone="success">Deadline Extraction</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Workbench ini menyiapkan Document AI untuk ringkasan, deadline, risiko, nominal, pihak,
          dan status dokumen. Tipe dokumen yang didukung saat ini meliputi contract, agreement, NDA,
          purchase order, dan invoice dengan hasil yang tetap melewati human review sebelum aksi
          sensitif.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Upload Document</p>
              <h3 className="text-xl font-semibold">Choose the document you want AI to analyze</h3>
            </div>
            <StatusBadge tone="neutral">
              {foundationQuery.data?.data.documentTypes.length ?? 5} document types
            </StatusBadge>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Document type</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value as AiDocumentReviewType)}
              >
                {(foundationQuery.data?.data.documentTypes ?? ['CONTRACT']).map((type) => (
                  <option key={type} value={type}>
                    {type.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">File upload</span>
              <input
                type="file"
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg"
                className="rounded-2xl border border-dashed px-4 py-6 text-sm"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
            </label>

            <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm leading-6 text-muted dark:border-slate-800 dark:bg-slate-950/70">
              {selectedFile ? (
                <>
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p>
                    {(selectedFile.size / 1024).toFixed(1)} KB •{' '}
                    {selectedFile.type || 'unknown type'}
                  </p>
                </>
              ) : (
                <p>
                  Belum ada file dipilih. Gunakan contract, agreement, NDA, purchase order, atau
                  invoice.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => reviewMutation.mutate()}
              disabled={!selectedFile || reviewMutation.isPending}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
            >
              {reviewMutation.isPending ? 'Analyzing document...' : 'Run document AI'}
            </button>

            {reviewMutation.isError ? (
              <p className="text-sm text-rose-600">{reviewMutation.error.message}</p>
            ) : null}
          </div>
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Output Contract</p>
              <h3 className="text-xl font-semibold">
                The sections Document AI will always try to extract
              </h3>
            </div>
            <StatusBadge tone="neutral">
              {foundationQuery.data?.data.outputSections.length ?? 6} sections
            </StatusBadge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(
              foundationQuery.data?.data.outputSections ?? [
                'Ringkasan',
                'Deadline',
                'Risiko',
                'Nominal',
                'Pihak',
                'Status',
              ]
            ).map((section) => (
              <div
                key={section}
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950/70"
              >
                {section}
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(foundationQuery.data?.data.reviewStatuses ?? ['ACTIVE', 'REVIEW_NEEDED']).map(
              (status) => (
                <div
                  key={status}
                  className="rounded-2xl border border-slate-200/80 px-4 py-3 text-sm font-medium dark:border-slate-800"
                >
                  {status.replaceAll('_', ' ')}
                </div>
              ),
            )}
          </div>
        </SurfaceCard>
      </div>

      {analysis ? (
        <>
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Summary</p>
                  <h3 className="text-xl font-semibold">AI reading of the uploaded document</h3>
                </div>
                <StatusBadge tone={statusToneMap[analysis.status]}>
                  {analysis.status.replaceAll('_', ' ')}
                </StatusBadge>
              </div>

              <p className="text-sm leading-7 text-muted">{analysis.summary}</p>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ['Document type', analysis.documentType.replaceAll('_', ' ')],
                  ['Effective date', analysis.effectiveDate],
                  ['Expiry date', analysis.expiryDate ?? 'No expiry detected'],
                  [
                    'Nominal',
                    analysis.nominalAmount && analysis.currency
                      ? currencyFormatter.format(analysis.nominalAmount)
                      : 'No monetary amount detected',
                  ],
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
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Parties</p>
                  <h3 className="text-xl font-semibold">Who is involved and in what role</h3>
                </div>
                <StatusBadge tone="neutral">{analysis.parties.length} parties</StatusBadge>
              </div>

              <div className="grid gap-3">
                {analysis.parties.map((party) => (
                  <div
                    key={`${party.name}-${party.role}`}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <p className="text-sm font-semibold">{party.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                      {party.role}
                    </p>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Deadlines</p>
                  <h3 className="text-xl font-semibold">
                    Exact dates AI thinks the team should watch
                  </h3>
                </div>
                <StatusBadge tone="neutral">{analysis.deadlines.length} deadlines</StatusBadge>
              </div>

              <div className="grid gap-3">
                {analysis.deadlines.map((deadline) => (
                  <div
                    key={`${deadline.title}-${deadline.date}`}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <p className="text-sm font-semibold">{deadline.title}</p>
                    <p className="mt-1 text-sm text-muted">{deadline.date}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                      Owner: {deadline.owner}
                    </p>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Risk Review</p>
                  <h3 className="text-xl font-semibold">What should be escalated before action</h3>
                </div>
                <StatusBadge tone="neutral">{analysis.risks.length} risks</StatusBadge>
              </div>

              <div className="grid gap-3">
                {analysis.risks.map((risk) => (
                  <div
                    key={risk.title}
                    className="rounded-2xl border border-slate-200/80 px-4 py-3 dark:border-slate-800"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{risk.title}</p>
                      <StatusBadge tone={riskToneMap[risk.severity]}>{risk.severity}</StatusBadge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">{risk.rationale}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Extracted Signals</p>
                <h3 className="text-xl font-semibold">Key clauses and commercial hints</h3>
              </div>
              <div className="grid gap-3">
                {analysis.extractedSignals.map((signal) => (
                  <div
                    key={signal}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    {signal}
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">
                  Recommended Actions
                </p>
                <h3 className="text-xl font-semibold">Suggested next steps before users commit</h3>
              </div>
              <div className="grid gap-3">
                {analysis.recommendedActions.map((action) => (
                  <div
                    key={action}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    {action}
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
