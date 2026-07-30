'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import { type AiVisionScanMode } from '@nova/shared-types';

import { aiApi } from '@/services/api/ai';

const resultToneMap = {
  MATCHED: 'success',
  REVIEW_NEEDED: 'warning',
  ALERT: 'danger',
} as const;

export function VisionWorkbench() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanMode, setScanMode] = useState<AiVisionScanMode>('RACK');

  const foundationQuery = useQuery({
    queryKey: ['ai-vision-foundation'],
    queryFn: () => aiApi.getAiVision(),
    staleTime: 60_000,
  });

  const scanMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) {
        throw new Error('Please capture or upload an image first.');
      }

      return aiApi.scanAiVision(selectedFile, scanMode);
    },
  });

  const result = scanMutation.data?.data;

  return (
    <div className="space-y-4">
      <SurfaceCard tone="accent" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-violet-700 dark:text-violet-300">
              Sprint 14A / AI Vision
            </p>
            <h2 className="font-display text-3xl font-semibold">
              Gunakan kamera untuk scan rak, gudang, wajah absensi, dan PPE dari satu workbench
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">Camera Ready</StatusBadge>
            <StatusBadge tone="success">Stock + Safety</StatusBadge>
            <StatusBadge tone="success">Attendance Assist</StatusBadge>
          </div>
        </div>

        <p className="max-w-4xl text-base leading-7 text-muted">
          AI Vision menyiapkan scan berbasis kamera untuk mengenali lokasi, produk, jumlah, barcode,
          QR, lot, serial, absensi wajah, dan kepatuhan PPE. Hasil scan tetap diarahkan ke review
          operator atau supervisor sebelum aksi sensitif diposting.
        </p>
      </SurfaceCard>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Camera Capture</p>
              <h3 className="text-xl font-semibold">Choose the visual scan mode and image input</h3>
            </div>
            <StatusBadge tone="neutral">
              {foundationQuery.data?.data.supportedDevices.length ?? 3} devices
            </StatusBadge>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Scan mode</span>
              <select
                className="rounded-2xl border bg-transparent px-4 py-3"
                value={scanMode}
                onChange={(event) => setScanMode(event.target.value as AiVisionScanMode)}
              >
                {(foundationQuery.data?.data.scanModes ?? ['RACK']).map((mode) => (
                  <option key={mode} value={mode}>
                    {mode.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Camera image</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
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
                  Belum ada capture dipilih. Gunakan foto rak, aisle gudang, wajah absensi, atau
                  checkpoint PPE untuk demo AI Vision.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => scanMutation.mutate()}
              disabled={!selectedFile || scanMutation.isPending}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
            >
              {scanMutation.isPending ? 'Running camera analysis...' : 'Run AI Vision scan'}
            </button>

            {scanMutation.isError ? (
              <p className="text-sm text-rose-600">{scanMutation.error.message}</p>
            ) : null}
          </div>
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted">Detection Contract</p>
              <h3 className="text-xl font-semibold">
                Signals AI Vision will try to recognize from the image
              </h3>
            </div>
            <StatusBadge tone="neutral">
              {foundationQuery.data?.data.outputSignals.length ?? 8} signals
            </StatusBadge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(foundationQuery.data?.data.outputSignals ?? []).map((signal) => (
              <div
                key={signal}
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950/70"
              >
                {signal}
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(foundationQuery.data?.data.supportedDevices ?? []).map((device) => (
              <div
                key={device}
                className="rounded-2xl border border-slate-200/80 px-4 py-3 text-sm font-medium dark:border-slate-800"
              >
                {device}
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      {result ? (
        <>
          <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Scan Result</p>
                  <h3 className="text-xl font-semibold">
                    High-level outcome from the camera frame
                  </h3>
                </div>
                <StatusBadge tone={resultToneMap[result.resultStatus]}>
                  {result.resultStatus.replaceAll('_', ' ')}
                </StatusBadge>
              </div>

              <p className="text-sm leading-7 text-muted">{result.summary}</p>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ['Mode', result.scanMode.replaceAll('_', ' ')],
                  ['Site', result.site],
                  ['Captured at', result.capturedAt],
                  ['Confidence', `${result.confidencePct}% (${result.confidenceBand})`],
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
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Detections</p>
                  <h3 className="text-xl font-semibold">Objects and signals recognized</h3>
                </div>
                <StatusBadge tone="neutral">{result.detections.length} detections</StatusBadge>
              </div>

              <div className="grid gap-3">
                {result.detections.map((detection) => (
                  <div
                    key={`${detection.type}-${detection.label}`}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{detection.label}</p>
                      <StatusBadge tone="neutral">{detection.confidencePct}%</StatusBadge>
                    </div>
                    <p className="mt-2 text-sm text-muted">{detection.value}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>

          {result.countedItems.length > 0 ? (
            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Counted Items</p>
                  <h3 className="text-xl font-semibold">
                    Product, barcode, lot, and serial recognized from the scan
                  </h3>
                </div>
                <StatusBadge tone="neutral">{result.countedItems.length} items</StatusBadge>
              </div>

              <div className="grid gap-3">
                {result.countedItems.map((item) => (
                  <div
                    key={`${item.sku}-${item.barcode}`}
                    className="grid gap-2 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950/70 md:grid-cols-[1.3fr_0.7fr_1fr_0.8fr_0.8fr]"
                  >
                    <div>
                      <p className="font-semibold">{item.productName}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-muted">{item.sku}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-muted">Qty</p>
                      <p className="font-medium">{item.detectedQuantity}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-muted">Barcode</p>
                      <p className="font-medium">{item.barcode}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-muted">Lot</p>
                      <p className="font-medium">{item.lot ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-muted">Serial</p>
                      <p className="font-medium">{item.serial ?? 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">Attendance / PPE</p>
                  <h3 className="text-xl font-semibold">
                    People and safety context from the same camera frame
                  </h3>
                </div>
                <StatusBadge tone="neutral">
                  {result.attendanceMatch ? 'Attendance matched' : `${result.ppeChecks.length} PPE`}
                </StatusBadge>
              </div>

              {result.attendanceMatch ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    ['Employee', result.attendanceMatch.employeeName],
                    ['Employee ID', result.attendanceMatch.employeeId],
                    ['Department', result.attendanceMatch.department],
                    ['Shift', result.attendanceMatch.shift],
                    ['Marked at', result.attendanceMatch.attendanceMarkedAt],
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
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {result.ppeChecks.map((check) => (
                    <div
                      key={check.label}
                      className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">{check.label}</p>
                        <StatusBadge tone={check.detected ? 'success' : 'danger'}>
                          {check.detected ? 'Detected' : 'Missing'}
                        </StatusBadge>
                      </div>
                    </div>
                  ))}
                  {result.ppeChecks.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm text-muted dark:border-slate-800 dark:bg-slate-950/70">
                      No PPE result for this scan mode.
                    </div>
                  ) : null}
                </div>
              )}
            </SurfaceCard>

            <SurfaceCard className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted">
                    Recommended Actions
                  </p>
                  <h3 className="text-xl font-semibold">
                    Suggested next steps after the camera analysis
                  </h3>
                </div>
                <StatusBadge tone="neutral">{result.recommendedActions.length} actions</StatusBadge>
              </div>

              <div className="grid gap-3">
                {result.recommendedActions.map((action) => (
                  <div
                    key={action}
                    className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm leading-6 dark:border-slate-800 dark:bg-slate-950/70"
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
