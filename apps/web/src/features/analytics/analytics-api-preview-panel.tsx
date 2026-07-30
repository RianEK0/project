'use client';

import { useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import { type AnalyticsWorkspaceCapabilityStatus } from '@nova/shared-types';

import {
  analyticsApi,
  type AnalyticsCapabilityPreview,
  type AnalyticsDomainOperationsPreview,
  type AnalyticsEntityIntelligencePreview,
  type AnalyticsRealtimePreview,
  type AnalyticsSemanticModelPreview,
} from '@/services/api/analytics';

import { type AnalyticsCapabilityItem } from './analytics-capability-catalog';

type PreviewRow = {
  label: string;
  value: string;
};

type PreviewPanelData = {
  tone: AnalyticsWorkspaceCapabilityStatus;
  title: string;
  summary: string;
  capabilityRows: PreviewRow[];
  areaRows: PreviewRow[];
};

const formatLabel = (value: string) => value.replaceAll('_', ' ');
const formatPercent = (value: number) => `${value}%`;

const statusToneMap: Record<
  AnalyticsWorkspaceCapabilityStatus,
  'success' | 'neutral' | 'warning' | 'danger'
> = {
  READY: 'success',
  FOUNDATION: 'neutral',
  LIMITED: 'warning',
  BLOCKED: 'danger',
};

function formatCapabilityRows(capability: AnalyticsCapabilityPreview): PreviewRow[] {
  return [
    { label: 'Readiness', value: formatPercent(capability.readinessPct) },
    { label: 'Linked routes', value: `${capability.routeCount} routes` },
    { label: 'Primary use case', value: capability.primaryUseCase },
    { label: 'Next focus', value: capability.nextFocus },
  ];
}

function buildOperationsPanel(
  capability: AnalyticsCapabilityPreview,
  preview: AnalyticsDomainOperationsPreview,
): PreviewPanelData {
  return {
    tone: capability.status,
    title: `${capability.label} operations preview`,
    summary: `${capability.summary} ${preview.summary}`,
    capabilityRows: formatCapabilityRows(capability),
    areaRows: [
      {
        label: 'Enabled capabilities',
        value: `${preview.enabledCapabilities}/${preview.capabilitiesExpected}`,
      },
      { label: 'Domain coverage', value: formatPercent(preview.domainCoveragePct) },
      { label: 'Dashboard alignment', value: formatPercent(preview.dashboardAlignmentPct) },
      { label: 'Cross-process coverage', value: formatPercent(preview.crossProcessCoveragePct) },
    ],
  };
}

function buildEntityPanel(
  capability: AnalyticsCapabilityPreview,
  preview: AnalyticsEntityIntelligencePreview,
): PreviewPanelData {
  return {
    tone: capability.status,
    title: `${capability.label} entity preview`,
    summary: `${capability.summary} ${preview.summary}`,
    capabilityRows: formatCapabilityRows(capability),
    areaRows: [
      {
        label: 'Enabled capabilities',
        value: `${preview.enabledCapabilities}/${preview.capabilitiesExpected}`,
      },
      { label: 'Customer coverage', value: formatPercent(preview.customerCoveragePct) },
      { label: 'Supplier coverage', value: formatPercent(preview.supplierCoveragePct) },
      { label: 'Warehouse coverage', value: formatPercent(preview.warehouseCoveragePct) },
    ],
  };
}

function buildModelingPanel(
  capability: AnalyticsCapabilityPreview,
  preview: AnalyticsSemanticModelPreview,
): PreviewPanelData {
  return {
    tone: capability.status,
    title: `${capability.label} semantic model preview`,
    summary: `${capability.summary} ${preview.summary}`,
    capabilityRows: formatCapabilityRows(capability),
    areaRows: [
      {
        label: 'Enabled capabilities',
        value: `${preview.enabledCapabilities}/${preview.capabilitiesExpected}`,
      },
      { label: 'Fact coverage', value: formatPercent(preview.factCoveragePct) },
      { label: 'Dimension coverage', value: formatPercent(preview.dimensionCoveragePct) },
      { label: 'Cube readiness', value: formatPercent(preview.cubeReadinessPct) },
    ],
  };
}

function buildRealtimePanel(
  capability: AnalyticsCapabilityPreview,
  preview: AnalyticsRealtimePreview,
): PreviewPanelData {
  return {
    tone: capability.status,
    title: `${capability.label} realtime preview`,
    summary: `${capability.summary} ${preview.summary}`,
    capabilityRows: formatCapabilityRows(capability),
    areaRows: [
      {
        label: 'Enabled capabilities',
        value: `${preview.enabledCapabilities}/${preview.capabilitiesExpected}`,
      },
      { label: 'Stream coverage', value: formatPercent(preview.streamCoveragePct) },
      { label: 'Freshness SLA', value: formatPercent(preview.freshnessSlaPct) },
      { label: 'Alert coverage', value: formatPercent(preview.alertCoveragePct) },
    ],
  };
}

async function loadPreview(capability: AnalyticsCapabilityItem): Promise<PreviewPanelData> {
  switch (capability.apiPreview) {
    case 'operations': {
      const preview = await analyticsApi.getOperationsPreview();
      const item = preview.data.capabilities.find((candidate) => candidate.key === capability.key);

      if (!item) {
        throw new Error(`Missing operations preview for ${capability.key}`);
      }

      return buildOperationsPanel(item, preview.data);
    }
    case 'entity': {
      const preview = await analyticsApi.getEntityPreview();
      const item = preview.data.capabilities.find((candidate) => candidate.key === capability.key);

      if (!item) {
        throw new Error(`Missing entity preview for ${capability.key}`);
      }

      return buildEntityPanel(item, preview.data);
    }
    case 'modeling': {
      const preview = await analyticsApi.getModelingPreview();
      const item = preview.data.capabilities.find((candidate) => candidate.key === capability.key);

      if (!item) {
        throw new Error(`Missing modeling preview for ${capability.key}`);
      }

      return buildModelingPanel(item, preview.data);
    }
    case 'realtime': {
      const preview = await analyticsApi.getRealtimePreview();
      const item = preview.data.capabilities.find((candidate) => candidate.key === capability.key);

      if (!item) {
        throw new Error(`Missing realtime preview for ${capability.key}`);
      }

      return buildRealtimePanel(item, preview.data);
    }
  }
}

export function AnalyticsApiPreviewPanel({ capability }: { capability: AnalyticsCapabilityItem }) {
  const previewQuery = useQuery({
    queryKey: ['analytics-workspace-preview', capability.key],
    queryFn: () => loadPreview(capability),
    staleTime: 30_000,
  });

  if (previewQuery.isLoading) {
    return (
      <SurfaceCard className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">API Preview</p>
            <h3 className="text-xl font-semibold">Loading analytics readiness</h3>
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
          The analytics route is ready, but the current capability preview could not be loaded in
          this session.
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
        <StatusBadge tone={statusToneMap[previewQuery.data.tone]}>
          {formatLabel(previewQuery.data.tone)}
        </StatusBadge>
      </div>

      <p className="text-sm leading-6 text-muted">{previewQuery.data.summary}</p>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Capability Focus</p>
          <div className="grid gap-3">
            {previewQuery.data.capabilityRows.map((row) => (
              <div
                key={row.label}
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-muted">{row.label}</p>
                <p className="mt-1 text-sm font-medium">{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Area Health</p>
          <div className="grid gap-3">
            {previewQuery.data.areaRows.map((row) => (
              <div
                key={row.label}
                className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-muted">{row.label}</p>
                <p className="mt-1 text-sm font-medium">{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
