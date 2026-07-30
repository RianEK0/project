'use client';

import { useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import { type AiWorkspaceCapabilityStatus } from '@nova/shared-types';

import {
  aiApi,
  type AiAssistantsPreview,
  type AiCommandCenterPreview,
  type AiDocumentIntelligencePreview,
  type AiForecastRiskPreview,
  type AiOptimizationPreview,
  type AiPerceptionPreview,
  type AiWorkspaceCapabilityPreview,
} from '@/services/api/ai';

import { type AiCapabilityItem } from './ai-capability-catalog';

type PreviewRow = {
  label: string;
  value: string;
};

type PreviewPanelData = {
  tone: AiWorkspaceCapabilityStatus;
  title: string;
  summary: string;
  capabilityRows: PreviewRow[];
  areaRows: PreviewRow[];
};

const formatLabel = (value: string) => value.replaceAll('_', ' ');
const formatPercent = (value: number) => `${value}%`;

const statusToneMap: Record<
  AiWorkspaceCapabilityStatus,
  'success' | 'neutral' | 'warning' | 'danger'
> = {
  READY: 'success',
  FOUNDATION: 'neutral',
  LIMITED: 'warning',
  BLOCKED: 'danger',
};

function formatCapabilityRows(capability: AiWorkspaceCapabilityPreview): PreviewRow[] {
  return [
    { label: 'Readiness', value: formatPercent(capability.readinessPct) },
    { label: 'Linked routes', value: `${capability.routeCount} routes` },
    { label: 'Primary use case', value: capability.primaryUseCase },
    { label: 'Next focus', value: capability.nextFocus },
  ];
}

function buildCommandCenterPanel(
  capability: AiWorkspaceCapabilityPreview,
  preview: AiCommandCenterPreview,
): PreviewPanelData {
  return {
    tone: capability.status,
    title: `${capability.label} command preview`,
    summary: `${capability.summary} ${preview.summary}`,
    capabilityRows: formatCapabilityRows(capability),
    areaRows: [
      {
        label: 'Enabled capabilities',
        value: `${preview.enabledCapabilities}/${preview.capabilitiesExpected}`,
      },
      { label: 'Dashboard coverage', value: formatPercent(preview.dashboardCoveragePct) },
      { label: 'Orchestration coverage', value: formatPercent(preview.orchestrationCoveragePct) },
      { label: 'Narrative coverage', value: formatPercent(preview.narrativeCoveragePct) },
    ],
  };
}

function buildForecastRiskPanel(
  capability: AiWorkspaceCapabilityPreview,
  preview: AiForecastRiskPreview,
): PreviewPanelData {
  return {
    tone: capability.status,
    title: `${capability.label} forecast and risk preview`,
    summary: `${capability.summary} ${preview.summary}`,
    capabilityRows: formatCapabilityRows(capability),
    areaRows: [
      {
        label: 'Enabled capabilities',
        value: `${preview.enabledCapabilities}/${preview.capabilitiesExpected}`,
      },
      { label: 'Forecast coverage', value: formatPercent(preview.forecastCoveragePct) },
      { label: 'Anomaly coverage', value: formatPercent(preview.anomalyCoveragePct) },
      { label: 'Finance signals', value: formatPercent(preview.financeSignalCoveragePct) },
    ],
  };
}

function buildOptimizationPanel(
  capability: AiWorkspaceCapabilityPreview,
  preview: AiOptimizationPreview,
): PreviewPanelData {
  return {
    tone: capability.status,
    title: `${capability.label} optimization preview`,
    summary: `${capability.summary} ${preview.summary}`,
    capabilityRows: formatCapabilityRows(capability),
    areaRows: [
      {
        label: 'Enabled capabilities',
        value: `${preview.enabledCapabilities}/${preview.capabilitiesExpected}`,
      },
      { label: 'Recommendation coverage', value: formatPercent(preview.recommendationCoveragePct) },
      { label: 'Execution linkage', value: formatPercent(preview.executionLinkagePct) },
      { label: 'Cross-domain coverage', value: formatPercent(preview.crossDomainCoveragePct) },
    ],
  };
}

function buildDocumentPanel(
  capability: AiWorkspaceCapabilityPreview,
  preview: AiDocumentIntelligencePreview,
): PreviewPanelData {
  return {
    tone: capability.status,
    title: `${capability.label} document intelligence preview`,
    summary: `${capability.summary} ${preview.summary}`,
    capabilityRows: formatCapabilityRows(capability),
    areaRows: [
      {
        label: 'Enabled capabilities',
        value: `${preview.enabledCapabilities}/${preview.capabilitiesExpected}`,
      },
      { label: 'Extraction coverage', value: formatPercent(preview.extractionCoveragePct) },
      { label: 'Confidence coverage', value: formatPercent(preview.confidenceCoveragePct) },
      { label: 'Review governance', value: formatPercent(preview.reviewGovernancePct) },
    ],
  };
}

function buildAssistantsPanel(
  capability: AiWorkspaceCapabilityPreview,
  preview: AiAssistantsPreview,
): PreviewPanelData {
  return {
    tone: capability.status,
    title: `${capability.label} assistants preview`,
    summary: `${capability.summary} ${preview.summary}`,
    capabilityRows: formatCapabilityRows(capability),
    areaRows: [
      {
        label: 'Enabled capabilities',
        value: `${preview.enabledCapabilities}/${preview.capabilitiesExpected}`,
      },
      { label: 'Voice coverage', value: formatPercent(preview.voiceCoveragePct) },
      { label: 'Transcript governance', value: formatPercent(preview.transcriptGovernancePct) },
      { label: 'Follow-up capture', value: formatPercent(preview.followUpCapturePct) },
    ],
  };
}

function buildPerceptionPanel(
  capability: AiWorkspaceCapabilityPreview,
  preview: AiPerceptionPreview,
): PreviewPanelData {
  return {
    tone: capability.status,
    title: `${capability.label} perception preview`,
    summary: `${capability.summary} ${preview.summary}`,
    capabilityRows: formatCapabilityRows(capability),
    areaRows: [
      {
        label: 'Enabled capabilities',
        value: `${preview.enabledCapabilities}/${preview.capabilitiesExpected}`,
      },
      { label: 'Visual coverage', value: formatPercent(preview.visualCoveragePct) },
      { label: 'Counting accuracy', value: formatPercent(preview.countingAccuracyPct) },
      { label: 'Safety compliance', value: formatPercent(preview.safetyCompliancePct) },
    ],
  };
}

async function loadPreview(capability: AiCapabilityItem): Promise<PreviewPanelData> {
  switch (capability.apiPreview) {
    case 'command-center': {
      const preview = await aiApi.getAiCommandCenterPreview();
      const item = preview.data.capabilities.find((candidate) => candidate.key === capability.key);

      if (!item) {
        throw new Error(`Missing command center preview for ${capability.key}`);
      }

      return buildCommandCenterPanel(item, preview.data);
    }
    case 'forecast-risk': {
      const preview = await aiApi.getAiForecastRiskPreview();
      const item = preview.data.capabilities.find((candidate) => candidate.key === capability.key);

      if (!item) {
        throw new Error(`Missing forecast and risk preview for ${capability.key}`);
      }

      return buildForecastRiskPanel(item, preview.data);
    }
    case 'optimization': {
      const preview = await aiApi.getAiOptimizationPreview();
      const item = preview.data.capabilities.find((candidate) => candidate.key === capability.key);

      if (!item) {
        throw new Error(`Missing optimization preview for ${capability.key}`);
      }

      return buildOptimizationPanel(item, preview.data);
    }
    case 'document-intelligence': {
      const preview = await aiApi.getAiDocumentIntelligencePreview();
      const item = preview.data.capabilities.find((candidate) => candidate.key === capability.key);

      if (!item) {
        throw new Error(`Missing document intelligence preview for ${capability.key}`);
      }

      return buildDocumentPanel(item, preview.data);
    }
    case 'perception': {
      const preview = await aiApi.getAiPerceptionPreview();
      const item = preview.data.capabilities.find((candidate) => candidate.key === capability.key);

      if (!item) {
        throw new Error(`Missing perception preview for ${capability.key}`);
      }

      return buildPerceptionPanel(item, preview.data);
    }
    case 'assistants': {
      const preview = await aiApi.getAiAssistantsPreview();
      const item = preview.data.capabilities.find((candidate) => candidate.key === capability.key);

      if (!item) {
        throw new Error(`Missing assistants preview for ${capability.key}`);
      }

      return buildAssistantsPanel(item, preview.data);
    }
  }
}

export function AiApiPreviewPanel({ capability }: { capability: AiCapabilityItem }) {
  const previewQuery = useQuery({
    queryKey: ['ai-workspace-preview', capability.key],
    queryFn: () => loadPreview(capability),
    staleTime: 30_000,
  });

  if (previewQuery.isLoading) {
    return (
      <SurfaceCard className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">API Preview</p>
            <h3 className="text-xl font-semibold">Loading AI capability readiness</h3>
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
          The AI route is ready, but the current capability preview could not be loaded in this
          session.
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
