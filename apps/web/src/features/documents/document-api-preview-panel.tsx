'use client';

import { useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import { type DocumentWorkspaceCapabilityStatus } from '@nova/shared-types';

import {
  documentsApi,
  type DocumentCapabilityPreview,
  type DocumentFormatsPreview,
  type DocumentGovernancePreview,
  type DocumentRecordsPreview,
} from '@/services/api/documents';

import { type DocumentCapabilityItem } from './document-capability-catalog';

type PreviewRow = {
  label: string;
  value: string;
};

type PreviewPanelData = {
  tone: DocumentWorkspaceCapabilityStatus;
  title: string;
  summary: string;
  capabilityRows: PreviewRow[];
  areaRows: PreviewRow[];
};

const formatLabel = (value: string) => value.replaceAll('_', ' ');
const formatPercent = (value: number) => `${value}%`;

const statusToneMap: Record<
  DocumentWorkspaceCapabilityStatus,
  'success' | 'neutral' | 'warning' | 'danger'
> = {
  READY: 'success',
  FOUNDATION: 'neutral',
  LIMITED: 'warning',
  BLOCKED: 'danger',
};

function formatCapabilityRows(capability: DocumentCapabilityPreview): PreviewRow[] {
  return [
    { label: 'Readiness', value: formatPercent(capability.readinessPct) },
    { label: 'Linked routes', value: `${capability.routeCount} routes` },
    { label: 'Primary use case', value: capability.primaryUseCase },
    { label: 'Next focus', value: capability.nextFocus },
  ];
}

function buildFormatsPanel(
  capability: DocumentCapabilityPreview,
  preview: DocumentFormatsPreview,
): PreviewPanelData {
  return {
    tone: capability.status,
    title: `${capability.label} format preview`,
    summary: `${capability.summary} ${preview.summary}`,
    capabilityRows: formatCapabilityRows(capability),
    areaRows: [
      {
        label: 'Enabled capabilities',
        value: `${preview.enabledCapabilities}/${preview.capabilitiesExpected}`,
      },
      { label: 'Preview support', value: formatPercent(preview.previewSupportPct) },
      { label: 'Editing continuity', value: formatPercent(preview.editingContinuityPct) },
      { label: 'Searchability', value: formatPercent(preview.searchabilityPct) },
    ],
  };
}

function buildRecordsPanel(
  capability: DocumentCapabilityPreview,
  preview: DocumentRecordsPreview,
): PreviewPanelData {
  return {
    tone: capability.status,
    title: `${capability.label} record preview`,
    summary: `${capability.summary} ${preview.summary}`,
    capabilityRows: formatCapabilityRows(capability),
    areaRows: [
      {
        label: 'Enabled capabilities',
        value: `${preview.enabledCapabilities}/${preview.capabilitiesExpected}`,
      },
      { label: 'Contract coverage', value: formatPercent(preview.contractCoveragePct) },
      { label: 'Invoice coverage', value: formatPercent(preview.invoiceCoveragePct) },
      { label: 'Approval traceability', value: formatPercent(preview.approvalTraceabilityPct) },
    ],
  };
}

function buildGovernancePanel(
  capability: DocumentCapabilityPreview,
  preview: DocumentGovernancePreview,
): PreviewPanelData {
  return {
    tone: capability.status,
    title: `${capability.label} governance preview`,
    summary: `${capability.summary} ${preview.summary}`,
    capabilityRows: formatCapabilityRows(capability),
    areaRows: [
      {
        label: 'Enabled capabilities',
        value: `${preview.enabledCapabilities}/${preview.capabilitiesExpected}`,
      },
      { label: 'SOP coverage', value: formatPercent(preview.sopCoveragePct) },
      { label: 'Training coverage', value: formatPercent(preview.trainingCoveragePct) },
      { label: 'Policy control', value: formatPercent(preview.policyControlPct) },
    ],
  };
}

async function loadPreview(capability: DocumentCapabilityItem): Promise<PreviewPanelData> {
  switch (capability.apiPreview) {
    case 'formats': {
      const preview = await documentsApi.getFormatsPreview();
      const item = preview.data.capabilities.find((candidate) => candidate.key === capability.key);

      if (!item) {
        throw new Error(`Missing formats preview for ${capability.key}`);
      }

      return buildFormatsPanel(item, preview.data);
    }
    case 'records': {
      const preview = await documentsApi.getRecordsPreview();
      const item = preview.data.capabilities.find((candidate) => candidate.key === capability.key);

      if (!item) {
        throw new Error(`Missing records preview for ${capability.key}`);
      }

      return buildRecordsPanel(item, preview.data);
    }
    case 'governance': {
      const preview = await documentsApi.getGovernancePreview();
      const item = preview.data.capabilities.find((candidate) => candidate.key === capability.key);

      if (!item) {
        throw new Error(`Missing governance preview for ${capability.key}`);
      }

      return buildGovernancePanel(item, preview.data);
    }
  }
}

export function DocumentApiPreviewPanel({ capability }: { capability: DocumentCapabilityItem }) {
  const previewQuery = useQuery({
    queryKey: ['documents-workspace-preview', capability.key],
    queryFn: () => loadPreview(capability),
    staleTime: 30_000,
  });

  if (previewQuery.isLoading) {
    return (
      <SurfaceCard className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">API Preview</p>
            <h3 className="text-xl font-semibold">Loading document readiness</h3>
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
          The documents route is ready, but the current capability preview could not be loaded in
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
