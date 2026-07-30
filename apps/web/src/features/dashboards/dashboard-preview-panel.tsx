'use client';

import { useQuery } from '@tanstack/react-query';

import { StatusBadge, SurfaceCard } from '@nova/ui';
import { type DashboardSignalTone } from '@nova/shared-types';

import { dashboardsApi } from '@/services/api/dashboards';

import { type DashboardSlug } from './dashboard-catalog';

type PreviewRow = {
  label: string;
  value: string;
};

type PreviewPanelData = {
  tone: DashboardSignalTone | 'FOUNDATION';
  title: string;
  summary: string;
  rows: PreviewRow[];
};

const formatLabel = (value: string) => value.replaceAll('_', ' ');

const formatPercent = (value: number) => `${value}%`;

const formatTimes = (value: number) => `${value}x`;

const previewLoaders: Record<DashboardSlug, () => Promise<PreviewPanelData>> = {
  executive: async () => {
    const [foundation, preview] = await Promise.all([
      dashboardsApi.getExecutiveDashboard(),
      dashboardsApi.getExecutivePreview(),
    ]);
    const cashRunway = preview.data.scorecards.find((card) => card.id === 'cash-runway');

    return {
      tone: preview.data.overallSignal,
      title: 'Live executive preview',
      summary: `${preview.data.summary} ${foundation.data.relatedDashboards.length} linked dashboards support the current view.`,
      rows: [
        { label: 'Window', value: formatLabel(preview.data.window) },
        { label: 'Focus area', value: preview.data.focusArea },
        { label: 'Cash runway', value: cashRunway ? `${cashRunway.value} months` : 'N/A' },
        { label: 'Scorecards', value: `${preview.data.scorecards.length} active signals` },
      ],
    };
  },
  ceo: async () => {
    const [foundation, preview] = await Promise.all([
      dashboardsApi.getCeoDashboard(),
      dashboardsApi.getCeoBriefingPreview(),
    ]);

    return {
      tone: preview.data.summarySignal,
      title: 'Quarterly CEO briefing',
      summary: `${preview.data.boardSummary} ${foundation.data.agenda.length} agenda lanes are included in the briefing.`,
      rows: [
        { label: 'Top focus', value: preview.data.topFocus },
        { label: 'Action bias', value: preview.data.actionBias },
        { label: 'Window', value: formatLabel(preview.data.window) },
        { label: 'Briefing points', value: `${preview.data.briefingPoints.length} board notes` },
      ],
    };
  },
  finance: async () => {
    const [foundation, preview] = await Promise.all([
      dashboardsApi.getFinanceDashboard(),
      dashboardsApi.getFinanceScorecardPreview(),
    ]);

    return {
      tone: preview.data.overallSignal,
      title: 'Finance scorecard preview',
      summary: `${preview.data.summary} ${foundation.data.scorecards.length} core finance scorecards are linked from this view.`,
      rows: [
        { label: 'Runway', value: `${preview.data.runwayMonths} months` },
        { label: 'Current ratio', value: formatTimes(preview.data.currentRatio) },
        {
          label: 'Overdue vs cash',
          value: formatPercent(preview.data.overdueReceivablePctOfCash),
        },
        { label: 'Budget variance', value: formatPercent(preview.data.budgetVariancePct) },
      ],
    };
  },
  inventory: async () => {
    const [foundation, preview] = await Promise.all([
      dashboardsApi.getInventoryDashboard(),
      dashboardsApi.getInventoryHealthPreview(),
    ]);

    return {
      tone: preview.data.overallSignal,
      title: 'Inventory health preview',
      summary: `${preview.data.summary} ${foundation.data.relatedDashboards.length} adjacent workspaces connect to this stock view.`,
      rows: [
        { label: 'Blocked stock', value: formatPercent(preview.data.blockedPct) },
        { label: 'Aging stock', value: formatPercent(preview.data.agingPct) },
        { label: 'Stock accuracy', value: formatPercent(preview.data.stockAccuracyPct) },
        { label: 'Reorder alerts', value: `${preview.data.reorderAlerts}` },
      ],
    };
  },
  warehouse: async () => {
    const [foundation, preview] = await Promise.all([
      dashboardsApi.getWarehouseDashboard(),
      dashboardsApi.getWarehouseControlTowerPreview(),
    ]);

    return {
      tone: preview.data.overallSignal,
      title: 'Warehouse control tower preview',
      summary: `${preview.data.summary} ${foundation.data.scorecards.length} operational lanes feed this control tower.`,
      rows: [
        { label: 'Overdue rate', value: formatPercent(preview.data.overdueRate) },
        { label: 'Flow pressure', value: preview.data.flowPressure },
        { label: 'Dispatch ready', value: `${preview.data.dispatchReady}` },
        { label: 'Receipt backlog', value: `${preview.data.receiptBacklog}` },
      ],
    };
  },
  sales: async () => {
    const preview = await dashboardsApi.getSalesDashboard();

    return {
      tone: preview.data.summary.riskSignal,
      title: 'Sales order-to-cash preview',
      summary: `${preview.data.cards.length} signal cards are active across order, delivery, invoicing, and collection.`,
      rows: [
        { label: 'Fill rate', value: formatPercent(preview.data.summary.fillRate) },
        { label: 'Invoice rate', value: formatPercent(preview.data.summary.invoiceRate) },
        { label: 'Collection rate', value: formatPercent(preview.data.summary.collectionRate) },
        { label: 'Open order value', value: `${preview.data.summary.openOrderValue}` },
      ],
    };
  },
  crm: async () => {
    const preview = await dashboardsApi.getCrmDashboard();

    return {
      tone: 'FOUNDATION',
      title: 'CRM starter preview',
      summary: `${preview.data.cards.length} commercial cards are active for the current CRM dashboard starter.`,
      rows: [
        { label: 'Supported periods', value: preview.data.periods.map(formatLabel).join(', ') },
        { label: 'Primary card', value: preview.data.cards[0]?.label ?? 'Lead visibility' },
        { label: 'Pipeline card', value: preview.data.cards[3]?.label ?? 'Weighted pipeline' },
        { label: 'Commercial views', value: `${preview.data.cards.length} routes` },
      ],
    };
  },
  hr: async () => {
    const [foundation, preview] = await Promise.all([
      dashboardsApi.getHrDashboard(),
      dashboardsApi.getHrPeopleOpsPreview(),
    ]);

    return {
      tone: preview.data.overallSignal,
      title: 'People ops preview',
      summary: `${preview.data.summary} ${foundation.data.scorecards.length} HR lanes feed this scorecard.`,
      rows: [
        { label: 'Attendance', value: formatPercent(preview.data.attendanceRatePct) },
        { label: 'Review backlog', value: formatPercent(preview.data.reviewBacklogPct) },
        { label: 'Recruiting load', value: formatPercent(preview.data.recruitingLoadPct) },
        { label: 'Training completion', value: formatPercent(preview.data.trainingCompletionPct) },
      ],
    };
  },
  manufacturing: async () => {
    const [foundation, preview] = await Promise.all([
      dashboardsApi.getManufacturingDashboard(),
      dashboardsApi.getManufacturingThroughputPreview(),
    ]);

    return {
      tone: preview.data.overallSignal,
      title: 'Manufacturing throughput preview',
      summary: `${preview.data.summary} ${foundation.data.scorecards.length} production lanes contribute to this weekly view.`,
      rows: [
        { label: 'Work center', value: preview.data.workCenter },
        { label: 'Utilization', value: formatPercent(preview.data.utilizationPct) },
        { label: 'First-pass yield', value: formatPercent(preview.data.firstPassYieldPct) },
        { label: 'Shortage orders', value: `${preview.data.shortageOrders}` },
      ],
    };
  },
};

const toneToBadge = (tone: PreviewPanelData['tone']) => {
  switch (tone) {
    case 'HEALTHY':
      return 'success';
    case 'WATCH':
      return 'warning';
    case 'AT_RISK':
    case 'CRITICAL':
      return 'danger';
    case 'FOUNDATION':
      return 'neutral';
  }
};

export function DashboardPreviewPanel({ dashboardSlug }: { dashboardSlug: DashboardSlug }) {
  const previewQuery = useQuery({
    queryKey: ['dashboard-preview', dashboardSlug],
    queryFn: previewLoaders[dashboardSlug],
    staleTime: 30_000,
  });

  if (previewQuery.isLoading) {
    return (
      <SurfaceCard className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">API Preview</p>
            <h3 className="text-xl font-semibold">Loading live dashboard summary</h3>
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
          The dashboard route is ready, but the preview payload could not be loaded in the current
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
        <StatusBadge tone={toneToBadge(previewQuery.data.tone)}>
          {formatLabel(previewQuery.data.tone)}
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
