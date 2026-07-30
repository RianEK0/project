'use client';

import { useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import { type PlatformCapabilityStatus } from '@nova/shared-types';

import {
  platformApi,
  type PlatformControlPreview,
  type PlatformExperiencePreview,
  type PlatformIdentityPreview,
  type PlatformTopologyPreview,
} from '@/services/api/platform';

import { type PlatformCapabilityItem } from './platform-capability-catalog';

type PreviewRow = {
  label: string;
  value: string;
};

type PreviewPanelData = {
  tone: PlatformCapabilityStatus;
  title: string;
  summary: string;
  controlRows: PreviewRow[];
  areaRows: PreviewRow[];
};

const formatLabel = (value: string) => value.replaceAll('_', ' ');
const formatPercent = (value: number) => `${value}%`;

const statusToneMap: Record<
  PlatformCapabilityStatus,
  'success' | 'neutral' | 'warning' | 'danger'
> = {
  READY: 'success',
  FOUNDATION: 'neutral',
  LIMITED: 'warning',
  BLOCKED: 'danger',
};

function formatControlRows(control: PlatformControlPreview): PreviewRow[] {
  return [
    { label: 'Readiness', value: formatPercent(control.readinessPct) },
    { label: 'Linked routes', value: `${control.routeCount} routes` },
    { label: 'Primary use case', value: control.primaryUseCase },
    { label: 'Next focus', value: control.nextFocus },
  ];
}

function buildTopologyPanel(
  control: PlatformControlPreview,
  preview: PlatformTopologyPreview,
): PreviewPanelData {
  return {
    tone: control.status,
    title: `${control.label} topology preview`,
    summary: `${control.summary} ${preview.summary}`,
    controlRows: formatControlRows(control),
    areaRows: [
      {
        label: 'Enabled controls',
        value: `${preview.enabledControls}/${preview.controlsExpected}`,
      },
      { label: 'Company scope', value: formatPercent(preview.companyScopePct) },
      { label: 'Branch coverage', value: formatPercent(preview.branchCoveragePct) },
      { label: 'Locale coverage', value: formatPercent(preview.localeCoveragePct) },
    ],
  };
}

function buildExperiencePanel(
  control: PlatformControlPreview,
  preview: PlatformExperiencePreview,
): PreviewPanelData {
  return {
    tone: control.status,
    title: `${control.label} experience preview`,
    summary: `${control.summary} ${preview.summary}`,
    controlRows: formatControlRows(control),
    areaRows: [
      {
        label: 'Enabled controls',
        value: `${preview.enabledControls}/${preview.controlsExpected}`,
      },
      { label: 'Branding coverage', value: formatPercent(preview.brandingCoveragePct) },
      { label: 'Marketplace readiness', value: formatPercent(preview.marketplaceReadinessPct) },
      {
        label: 'Extension governance',
        value: formatPercent(preview.extensionGovernancePct),
      },
    ],
  };
}

function buildIdentityPanel(
  control: PlatformControlPreview,
  preview: PlatformIdentityPreview,
): PreviewPanelData {
  return {
    tone: control.status,
    title: `${control.label} identity and trust preview`,
    summary: `${control.summary} ${preview.summary}`,
    controlRows: formatControlRows(control),
    areaRows: [
      {
        label: 'Enabled controls',
        value: `${preview.enabledControls}/${preview.controlsExpected}`,
      },
      { label: 'Audit coverage', value: formatPercent(preview.auditCoveragePct) },
      { label: 'Compliance coverage', value: formatPercent(preview.complianceCoveragePct) },
      { label: 'Federation coverage', value: formatPercent(preview.federationCoveragePct) },
    ],
  };
}

async function loadPreview(capability: PlatformCapabilityItem): Promise<PreviewPanelData> {
  switch (capability.apiPreview) {
    case 'topology': {
      const preview = await platformApi.getTopologyPreview();
      const item = preview.data.controls.find((candidate) => candidate.key === capability.key);

      if (!item) {
        throw new Error(`Missing topology control preview for ${capability.key}`);
      }

      return buildTopologyPanel(item, preview.data);
    }
    case 'experience': {
      const preview = await platformApi.getExperiencePreview();
      const item = preview.data.controls.find((candidate) => candidate.key === capability.key);

      if (!item) {
        throw new Error(`Missing experience control preview for ${capability.key}`);
      }

      return buildExperiencePanel(item, preview.data);
    }
    case 'identity': {
      const preview = await platformApi.getIdentityPreview();
      const item = preview.data.controls.find((candidate) => candidate.key === capability.key);

      if (!item) {
        throw new Error(`Missing identity control preview for ${capability.key}`);
      }

      return buildIdentityPanel(item, preview.data);
    }
  }
}

export function PlatformApiPreviewPanel({ capability }: { capability: PlatformCapabilityItem }) {
  const previewQuery = useQuery({
    queryKey: ['platform-preview', capability.key],
    queryFn: () => loadPreview(capability),
    staleTime: 30_000,
  });

  if (previewQuery.isLoading) {
    return (
      <SurfaceCard className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">API Preview</p>
            <h3 className="text-xl font-semibold">Loading platform readiness</h3>
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
          The platform route is ready, but the current capability preview could not be loaded in
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
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Control Focus</p>
          <div className="grid gap-3">
            {previewQuery.data.controlRows.map((row) => (
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
