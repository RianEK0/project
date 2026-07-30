'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import { type AiOcrDocumentType } from '@nova/shared-types';

import { aiApi } from '@/services/api/ai';

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const saveStatusTone = {
  READY_TO_SAVE: 'success',
  REVIEW_NEEDED: 'warning',
} as const;

export function DocumentOcrWorkbench() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<AiOcrDocumentType>('INVOICE');

  const foundationQuery = useQuery({
    queryKey: ['ai-document-ocr-foundation'],
    queryFn: () => aiApi.getAiDocumentOcr(),
    staleTime: 60_000,
  });

  const extractionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) {
        throw new Error('Please choose a photo or PDF first.');
      }

      return aiApi.extractAiDocumentOcr(selectedFile, documentType);
    },
  });

  const extracted = extractionMutation.data?.data;

  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-rose-700 dark:text-rose-300">
              Sprint 11C / OCR
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Upload foto invoice atau dokumen operasional lalu ubah menjadi data yang siap ditinjau
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Multipart Upload</StatusBadge>
            <StatusBadge tone="success">AI OCR Preview</StatusBadge>
            <StatusBadge tone="success">Database Mapping</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          Workbench ini memfokuskan flow upload foto atau PDF, lalu AI membaca field seperti
          supplier, tanggal, nomor, PPN, item, dan harga. Hasilnya dipetakan ke target database
          seperti supplier, invoice, invoice item, atau purchase invoice preparation sebelum review
          final.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Upload Photo</p>
              <h3 className="text-xl font-semibold">Send a photo or PDF into the OCR lane</h3>
            </div>
            <StatusBadge tone="neutral">
              {foundationQuery.data?.data.acceptedMimeTypes.length ?? 4} mime types
            </StatusBadge>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Document type</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value as AiOcrDocumentType)}
              >
                {(foundationQuery.data?.data.documentTypes ?? ['INVOICE']).map((type) => (
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
                accept="image/png,image/jpeg,image/webp,application/pdf"
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
                  Belum ada file dipilih. Gunakan foto invoice supplier atau PDF untuk demo OCR.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => extractionMutation.mutate()}
              disabled={!selectedFile || extractionMutation.isPending}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
            >
              {extractionMutation.isPending ? 'Reading document...' : 'Run OCR extraction'}
            </button>

            {extractionMutation.isError ? (
              <p className="text-sm text-rose-600">{extractionMutation.error.message}</p>
            ) : null}
          </div>
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Extraction Contract</p>
              <h3 className="text-xl font-semibold">
                Fields and database targets prepared by the API
              </h3>
            </div>
            <StatusBadge tone="neutral">
              {foundationQuery.data?.data.extractedFields.length ?? 6} fields
            </StatusBadge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(
              foundationQuery.data?.data.extractedFields ?? [
                'Supplier',
                'Tanggal',
                'Nomor',
                'PPN',
                'Item',
                'Harga',
              ]
            ).map((field) => (
              <div
                key={field}
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950/70"
              >
                {field}
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(
              foundationQuery.data?.data.databaseTargets ?? [
                'Supplier',
                'Invoice',
                'InvoiceItem',
                'PurchaseInvoicePreparation',
              ]
            ).map((target) => (
              <div
                key={target}
                className="rounded-2xl border border-slate-200/80 px-4 py-3 text-sm font-medium dark:border-slate-800"
              >
                {target}
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      {extracted ? (
        <>
          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">OCR Result</p>
                  <h3 className="text-xl font-semibold">
                    Invoice-level fields read from the upload
                  </h3>
                </div>
                <StatusBadge tone={saveStatusTone[extracted.saveStatus]}>
                  {extracted.saveStatus.replaceAll('_', ' ')}
                </StatusBadge>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ['Supplier', extracted.supplier],
                  ['Tanggal', extracted.invoiceDate],
                  ['Nomor', extracted.invoiceNumber],
                  ['PPN', currencyFormatter.format(extracted.ppnAmount)],
                  ['Subtotal', currencyFormatter.format(extracted.subtotalAmount)],
                  ['Total', currencyFormatter.format(extracted.totalAmount)],
                  ['Confidence', `${extracted.confidencePct}% (${extracted.confidenceBand})`],
                  ['Bahasa', extracted.detectedLanguage],
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

              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.18em] text-muted">Warnings</p>
                <div className="grid gap-2">
                  {extracted.warnings.map((warning) => (
                    <div
                      key={warning}
                      className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm dark:border-amber-900/60 dark:bg-amber-950/30"
                    >
                      {warning}
                    </div>
                  ))}
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Line Items</p>
                  <h3 className="text-xl font-semibold">
                    Item, quantity, and pricing captured by OCR
                  </h3>
                </div>
                <StatusBadge tone="neutral">{extracted.items.length} rows</StatusBadge>
              </div>

              <div className="grid gap-3">
                {extracted.items.map((item, index) => (
                  <div
                    key={`${item.description}-${index}`}
                    className="grid gap-2 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950/70 md:grid-cols-[1.6fr_0.7fr_0.8fr_0.9fr]"
                  >
                    <p className="font-medium">{item.description}</p>
                    <p>{item.quantity} qty</p>
                    <p>{currencyFormatter.format(item.unitPrice)}</p>
                    <p>{currencyFormatter.format(item.lineTotal)}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>

          <SurfaceCard className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-muted">
                  Database Write Preview
                </p>
                <h3 className="text-xl font-semibold">Where the extracted data wants to go next</h3>
              </div>
              <StatusBadge tone="neutral">
                {extracted.databaseWritePreview.length} targets
              </StatusBadge>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {extracted.databaseWritePreview.map((target) => (
                <div
                  key={target.entity}
                  className="rounded-2xl border border-slate-200/80 px-4 py-3 dark:border-slate-800"
                >
                  <p className="text-sm font-semibold">{target.entity}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">
                    {target.action.replaceAll('_', ' ')}
                  </p>
                  <p className="mt-2 text-sm text-muted">{target.mappedFields.join(', ')}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </>
      ) : null}
    </div>
  );
}
