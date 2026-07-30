'use client';

import { useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';

import { mobileApi } from '@/services/api/mobile';

import { type MobileCapabilitySlug } from './mobile-capability-catalog';

type PreviewRow = {
  label: string;
  value: string;
};

type PreviewPanelData = {
  status: string;
  title: string;
  summary: string;
  rows: PreviewRow[];
};

const formatLabel = (value: string) => value.replaceAll('_', ' ');

const statusToBadgeTone = (status: string) => {
  switch (status) {
    case 'READY':
    case 'ONLINE':
    case 'SYNCING':
      return 'success';
    case 'FOUNDATION':
      return 'warning';
    case 'LIMITED':
    case 'BLOCKED':
    case 'CONFLICT':
      return 'danger';
    default:
      return 'neutral';
  }
};

const previewLoaders: Partial<Record<MobileCapabilitySlug, () => Promise<PreviewPanelData>>> = {
  pwa: async () => {
    const [foundation, preview] = await Promise.all([
      mobileApi.getWorkspace(),
      mobileApi.getPwaPreview(),
    ]);

    return {
      status: preview.data.status,
      title: 'PWA readiness preview',
      summary: `${preview.data.summary} ${foundation.data.cards.length} mobile workspace cards are wired into the current shell.`,
      rows: [
        { label: 'Installable', value: preview.data.installable ? 'Yes' : 'No' },
        { label: 'Offline coverage', value: `${preview.data.offlineCoveragePct}%` },
        { label: 'Shortcut coverage', value: `${preview.data.shortcutCoveragePct}%` },
        { label: 'Push ready', value: preview.data.pushEnabled ? 'Yes' : 'No' },
      ],
    };
  },
  'offline-sync': async () => {
    const preview = await mobileApi.getOfflineSyncPreview();

    return {
      status: preview.data.status,
      title: 'Offline sync preview',
      summary: preview.data.summary,
      rows: [
        { label: 'Queue depth', value: `${preview.data.queueDepth}` },
        { label: 'Replay success', value: `${preview.data.replaySuccessRatePct}%` },
        { label: 'Oldest pending', value: `${preview.data.oldestPendingMinutes} min` },
        { label: 'Sync pressure', value: preview.data.syncPressure },
      ],
    };
  },
  'tablet-ui': async () => {
    const preview = await mobileApi.getWarehouseUiPreview();

    return {
      status: preview.data.status,
      title: 'Tablet surface preview',
      summary: `${preview.data.summary} Tablet adoption is currently ${preview.data.tabletUtilizationPct}%.`,
      rows: [
        { label: 'Tablet utilization', value: `${preview.data.tabletUtilizationPct}%` },
        { label: 'Push acknowledgement', value: `${preview.data.pushAcknowledgeMinutes} min` },
        { label: 'Scan success', value: `${preview.data.scanSuccessRatePct}%` },
        { label: 'Battery coverage', value: `${preview.data.deviceBatteryPct}%` },
      ],
    };
  },
  'warehouse-ui': async () => {
    const preview = await mobileApi.getWarehouseUiPreview();

    return {
      status: preview.data.status,
      title: 'Warehouse handheld preview',
      summary: preview.data.summary,
      rows: [
        { label: 'Scan success', value: `${preview.data.scanSuccessRatePct}%` },
        { label: 'Average pick time', value: `${preview.data.averagePickSeconds} sec` },
        { label: 'GPS coverage', value: `${preview.data.gpsCoveragePct}%` },
        { label: 'Supported surfaces', value: preview.data.supportedSurfaces.join(', ') },
      ],
    };
  },
};

export function MobileApiPreviewPanel({
  capabilitySlug,
}: {
  capabilitySlug: MobileCapabilitySlug;
}) {
  const previewLoader = previewLoaders[capabilitySlug];

  if (!previewLoader) {
    return null;
  }

  const previewQuery = useQuery({
    queryKey: ['mobile-api-preview', capabilitySlug],
    queryFn: previewLoader,
    staleTime: 30_000,
  });

  if (previewQuery.isLoading) {
    return (
      <SurfaceCard className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">API Preview</p>
            <h3 className="text-xl font-semibold">Loading mobile capability summary</h3>
          </div>
          <StatusBadge tone="neutral">Fetching</StatusBadge>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-2xl border border-slate-200/80 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      </SurfaceCard>
    );
  }

  if (previewQuery.isError || !previewQuery.data) {
    return (
      <SurfaceCard className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">API Preview</p>
            <h3 className="text-xl font-semibold">Preview temporarily unavailable</h3>
          </div>
          <StatusBadge tone="danger">Unavailable</StatusBadge>
        </div>
        <p className="text-sm leading-6 text-muted">
          The capability route is ready, but the current API preview could not be loaded.
        </p>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-muted">API Preview</p>
          <h3 className="text-xl font-semibold">{previewQuery.data.title}</h3>
        </div>
        <StatusBadge tone={statusToBadgeTone(previewQuery.data.status)}>
          {formatLabel(previewQuery.data.status)}
        </StatusBadge>
      </div>
      <p className="text-sm leading-6 text-muted">{previewQuery.data.summary}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {previewQuery.data.rows.map((row) => (
          <div
            key={row.label}
            className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-muted">{row.label}</p>
            <p className="mt-2 text-lg font-semibold">{row.value}</p>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}
