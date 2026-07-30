'use client';

import { useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import { type IntegrationConnectionStatus } from '@nova/shared-types';

import {
  integrationsApi,
  type AiIntegrationPreview,
  type IntegrationProviderPreview,
  type MessagingIntegrationPreview,
  type PaymentsIntegrationPreview,
  type StorageIntegrationPreview,
  type SuiteIntegrationPreview,
} from '@/services/api/integrations';

import { type IntegrationProviderItem } from './integration-provider-catalog';

type PreviewRow = {
  label: string;
  value: string;
};

type PreviewPanelData = {
  tone: IntegrationConnectionStatus;
  title: string;
  summary: string;
  providerRows: PreviewRow[];
  portfolioRows: PreviewRow[];
};

const formatLabel = (value: string) => value.replaceAll('_', ' ');
const formatPercent = (value: number) => `${value}%`;

const statusToneMap: Record<
  IntegrationConnectionStatus,
  'success' | 'neutral' | 'warning' | 'danger'
> = {
  READY: 'success',
  FOUNDATION: 'neutral',
  LIMITED: 'warning',
  BLOCKED: 'danger',
};

function formatProviderRows(provider: IntegrationProviderPreview): PreviewRow[] {
  return [
    { label: 'Auth modes', value: provider.authModes.map(formatLabel).join(', ') },
    { label: 'Readiness', value: formatPercent(provider.readinessPct) },
    { label: 'Linked routes', value: `${provider.routeCount} routes` },
    { label: 'Primary use case', value: provider.primaryUseCase },
  ];
}

function buildPaymentsPanel(
  provider: IntegrationProviderPreview,
  preview: PaymentsIntegrationPreview,
): PreviewPanelData {
  return {
    tone: provider.status,
    title: `${provider.label} payment connector preview`,
    summary: `${provider.summary} ${preview.summary}`,
    providerRows: formatProviderRows(provider),
    portfolioRows: [
      {
        label: 'Connected providers',
        value: `${preview.connectedProviders}/${preview.providersExpected}`,
      },
      { label: 'Webhook coverage', value: formatPercent(preview.webhookCoveragePct) },
      { label: 'Settlement match', value: formatPercent(preview.settlementMatchRatePct) },
      { label: 'Ledger routing', value: formatPercent(preview.ledgerRoutingCoveragePct) },
    ],
  };
}

function buildSuitePanel(
  provider: IntegrationProviderPreview,
  preview: SuiteIntegrationPreview,
): PreviewPanelData {
  return {
    tone: provider.status,
    title: `${provider.label} suite connector preview`,
    summary: `${provider.summary} ${preview.summary}`,
    providerRows: formatProviderRows(provider),
    portfolioRows: [
      {
        label: 'Connected providers',
        value: `${preview.connectedProviders}/${preview.providersExpected}`,
      },
      { label: 'Directory sync', value: formatPercent(preview.directorySyncCoveragePct) },
      { label: 'Calendar sync', value: formatPercent(preview.calendarSyncCoveragePct) },
      {
        label: 'Document collaboration',
        value: formatPercent(preview.documentCollaborationCoveragePct),
      },
    ],
  };
}

function buildMessagingPanel(
  provider: IntegrationProviderPreview,
  preview: MessagingIntegrationPreview,
): PreviewPanelData {
  return {
    tone: provider.status,
    title: `${provider.label} messaging connector preview`,
    summary: `${provider.summary} ${preview.summary}`,
    providerRows: formatProviderRows(provider),
    portfolioRows: [
      {
        label: 'Connected providers',
        value: `${preview.connectedProviders}/${preview.providersExpected}`,
      },
      { label: 'Delivery visibility', value: formatPercent(preview.deliveryVisibilityPct) },
      { label: 'Automation binding', value: formatPercent(preview.automationBindingPct) },
      { label: 'Incoming webhooks', value: formatPercent(preview.incomingWebhookCoveragePct) },
    ],
  };
}

function buildStoragePanel(
  provider: IntegrationProviderPreview,
  preview: StorageIntegrationPreview,
): PreviewPanelData {
  return {
    tone: provider.status,
    title: `${provider.label} storage connector preview`,
    summary: `${provider.summary} ${preview.summary}`,
    providerRows: formatProviderRows(provider),
    portfolioRows: [
      {
        label: 'Connected providers',
        value: `${preview.connectedProviders}/${preview.providersExpected}`,
      },
      { label: 'Retention coverage', value: formatPercent(preview.retentionCoveragePct) },
      { label: 'Signed access', value: formatPercent(preview.signedUrlCoveragePct) },
      { label: 'Backup redundancy', value: formatPercent(preview.backupRedundancyPct) },
    ],
  };
}

function buildAiPanel(
  provider: IntegrationProviderPreview,
  preview: AiIntegrationPreview,
): PreviewPanelData {
  return {
    tone: provider.status,
    title: `${provider.label} AI provider preview`,
    summary: `${provider.summary} ${preview.summary}`,
    providerRows: formatProviderRows(provider),
    portfolioRows: [
      {
        label: 'Connected providers',
        value: `${preview.connectedProviders}/${preview.providersExpected}`,
      },
      { label: 'Prompt governance', value: formatPercent(preview.promptGovernancePct) },
      { label: 'Fallback coverage', value: formatPercent(preview.fallbackCoveragePct) },
      { label: 'Model routing', value: formatPercent(preview.modelRoutingCoveragePct) },
    ],
  };
}

async function loadPreview(provider: IntegrationProviderItem): Promise<PreviewPanelData> {
  switch (provider.apiPreview) {
    case 'payments': {
      const preview = await integrationsApi.getPaymentsPreview();
      const item = preview.data.providers.find((candidate) => candidate.key === provider.key);

      if (!item) {
        throw new Error(`Missing payment provider preview for ${provider.key}`);
      }

      return buildPaymentsPanel(item, preview.data);
    }
    case 'suite': {
      const preview = await integrationsApi.getSuitePreview();
      const item = preview.data.providers.find((candidate) => candidate.key === provider.key);

      if (!item) {
        throw new Error(`Missing suite provider preview for ${provider.key}`);
      }

      return buildSuitePanel(item, preview.data);
    }
    case 'messaging': {
      const preview = await integrationsApi.getMessagingPreview();
      const item = preview.data.providers.find((candidate) => candidate.key === provider.key);

      if (!item) {
        throw new Error(`Missing messaging provider preview for ${provider.key}`);
      }

      return buildMessagingPanel(item, preview.data);
    }
    case 'storage': {
      const preview = await integrationsApi.getStoragePreview();
      const item = preview.data.providers.find((candidate) => candidate.key === provider.key);

      if (!item) {
        throw new Error(`Missing storage provider preview for ${provider.key}`);
      }

      return buildStoragePanel(item, preview.data);
    }
    case 'ai': {
      const preview = await integrationsApi.getAiPreview();
      const item = preview.data.providers.find((candidate) => candidate.key === provider.key);

      if (!item) {
        throw new Error(`Missing AI provider preview for ${provider.key}`);
      }

      return buildAiPanel(item, preview.data);
    }
  }
}

export function IntegrationApiPreviewPanel({ provider }: { provider: IntegrationProviderItem }) {
  const previewQuery = useQuery({
    queryKey: ['integration-preview', provider.key],
    queryFn: () => loadPreview(provider),
    staleTime: 30_000,
  });

  if (previewQuery.isLoading) {
    return (
      <SurfaceCard className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">API Preview</p>
            <h3 className="text-xl font-semibold">Loading provider readiness</h3>
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
          The integration route is ready, but the current provider preview could not be loaded in
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
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Provider Focus</p>
          <div className="grid gap-3">
            {previewQuery.data.providerRows.map((row) => (
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
          <p className="text-sm uppercase tracking-[0.18em] text-muted">Portfolio Health</p>
          <div className="grid gap-3">
            {previewQuery.data.portfolioRows.map((row) => (
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
