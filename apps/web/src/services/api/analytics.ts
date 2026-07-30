import type {
  AnalyticsWorkspaceArea,
  AnalyticsWorkspaceCapabilityKey,
  AnalyticsWorkspaceCapabilityStatus,
  BiDashboardLayoutMode,
  BiWidgetType,
  DashboardSignalTone,
  DashboardTimeWindow,
  ApiSuccessResponse,
  ReportBuilderBlockType,
  ReportBuilderExportFormat,
  ReportBuilderJoinType,
  SelfServeBuilderStatus,
} from '@nova/shared-types';

import { apiClient } from './client';

type AnalyticsRouteLink = {
  label: string;
  route: string;
};

type AnalyticsWorkspaceCard = {
  id: string;
  label: string;
  route: string;
  description: string;
};

export type AnalyticsWorkspaceFoundation = {
  capabilities: AnalyticsWorkspaceCapabilityKey[];
  areas: AnalyticsWorkspaceArea[];
  statuses: AnalyticsWorkspaceCapabilityStatus[];
  cards: AnalyticsWorkspaceCard[];
  relatedRoutes: AnalyticsRouteLink[];
};

export type AnalyticsCapabilityPreview = {
  key: AnalyticsWorkspaceCapabilityKey;
  label: string;
  status: AnalyticsWorkspaceCapabilityStatus;
  readinessPct: number;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
  summary: string;
};

type AnalyticsAreaPreview = {
  area: AnalyticsWorkspaceArea;
  status: AnalyticsWorkspaceCapabilityStatus;
  enabledCapabilities: number;
  capabilitiesExpected: number;
  nextFocus: string;
  summary: string;
  capabilities: AnalyticsCapabilityPreview[];
};

export type AnalyticsDomainOperationsPreview = AnalyticsAreaPreview & {
  area: 'DOMAIN_OPERATIONS';
  domainCoveragePct: number;
  dashboardAlignmentPct: number;
  crossProcessCoveragePct: number;
};

export type AnalyticsEntityIntelligencePreview = AnalyticsAreaPreview & {
  area: 'ENTITY_INTELLIGENCE';
  customerCoveragePct: number;
  supplierCoveragePct: number;
  warehouseCoveragePct: number;
};

export type AnalyticsSemanticModelPreview = AnalyticsAreaPreview & {
  area: 'SEMANTIC_MODEL';
  factCoveragePct: number;
  dimensionCoveragePct: number;
  cubeReadinessPct: number;
};

export type AnalyticsRealtimePreview = AnalyticsAreaPreview & {
  area: 'REALTIME';
  streamCoveragePct: number;
  freshnessSlaPct: number;
  alertCoveragePct: number;
};

export type BiBuilderStarterMetric = {
  domain: string;
  label: string;
  supportedWidgets: BiWidgetType[];
  defaultAggregation: string;
};

export type BiBuilderFoundation = {
  items: unknown[];
  statuses: SelfServeBuilderStatus[];
  widgetTypes: BiWidgetType[];
  layoutModes: BiDashboardLayoutMode[];
  timeWindows: DashboardTimeWindow[];
  supportedInteractions: string[];
  dataDomains: string[];
  starterMetrics: BiBuilderStarterMetric[];
};

export type BiDashboardPreviewStat = {
  label: string;
  value: string;
  tone: DashboardSignalTone;
};

export type BiDashboardPreviewWidget = {
  id: string;
  title: string;
  type: BiWidgetType;
  domain: string;
  metric: string;
  expectedVisual: string;
  insight: string;
  confidencePct: number;
};

export type BiDashboardPreview = {
  title: string;
  status: SelfServeBuilderStatus;
  layoutMode: BiDashboardLayoutMode;
  timeWindow: DashboardTimeWindow;
  widgetCount: number;
  forecastAnchorDate: string;
  filtersApplied: string[];
  narrative: string;
  spotlightStats: BiDashboardPreviewStat[];
  widgets: BiDashboardPreviewWidget[];
  collaborationTargets: string[];
};

export type BiDashboardPreviewRequest = {
  title: string;
  layoutMode: BiDashboardLayoutMode;
  timeWindow: DashboardTimeWindow;
  widgets: Array<{
    id: string;
    type: BiWidgetType;
    domain: string;
    metric: string;
  }>;
};

export type ReportBuilderFoundation = {
  items: unknown[];
  statuses: SelfServeBuilderStatus[];
  blockTypes: ReportBuilderBlockType[];
  joinTypes: ReportBuilderJoinType[];
  exportFormats: ReportBuilderExportFormat[];
  datasets: string[];
  starterColumns: string[];
};

export type ReportBuilderStage = {
  type: ReportBuilderBlockType;
  summary: string;
};

export type ReportBuilderPreview = {
  reportName: string;
  dataset: string;
  joinType: ReportBuilderJoinType;
  status: SelfServeBuilderStatus;
  blockCount: number;
  summary: string;
  sqlPreview: string;
  estimatedRows: number;
  outputColumns: string[];
  exportFormats: ReportBuilderExportFormat[];
  guardrails: string[];
  stages: ReportBuilderStage[];
  recommendedScheduleDate: string;
};

export type ReportBuilderPreviewRequest = {
  reportName: string;
  dataset: string;
  joinType: ReportBuilderJoinType;
  blocks: Array<{
    id: string;
    type: ReportBuilderBlockType;
  }>;
};

export type AnalyticsWorkspaceFoundationResponse = ApiSuccessResponse<AnalyticsWorkspaceFoundation>;
export type AnalyticsDomainOperationsPreviewResponse =
  ApiSuccessResponse<AnalyticsDomainOperationsPreview>;
export type AnalyticsEntityIntelligencePreviewResponse =
  ApiSuccessResponse<AnalyticsEntityIntelligencePreview>;
export type AnalyticsSemanticModelPreviewResponse =
  ApiSuccessResponse<AnalyticsSemanticModelPreview>;
export type AnalyticsRealtimePreviewResponse = ApiSuccessResponse<AnalyticsRealtimePreview>;
export type BiBuilderFoundationResponse = ApiSuccessResponse<BiBuilderFoundation>;
export type BiDashboardPreviewResponse = ApiSuccessResponse<BiDashboardPreview>;
export type ReportBuilderFoundationResponse = ApiSuccessResponse<ReportBuilderFoundation>;
export type ReportBuilderPreviewResponse = ApiSuccessResponse<ReportBuilderPreview>;

export const analyticsApi = {
  getWorkspace() {
    return apiClient.get<AnalyticsWorkspaceFoundationResponse>('/analytics-workspace');
  },
  getOperationsPreview() {
    return apiClient.get<AnalyticsDomainOperationsPreviewResponse>(
      '/analytics-workspace/operations-preview',
    );
  },
  getEntityPreview() {
    return apiClient.get<AnalyticsEntityIntelligencePreviewResponse>(
      '/analytics-workspace/entity-preview',
    );
  },
  getModelingPreview() {
    return apiClient.get<AnalyticsSemanticModelPreviewResponse>(
      '/analytics-workspace/modeling-preview',
    );
  },
  getRealtimePreview() {
    return apiClient.get<AnalyticsRealtimePreviewResponse>('/analytics-workspace/realtime-preview');
  },
  getBiBuilder() {
    return apiClient.get<BiBuilderFoundationResponse>('/bi-builder');
  },
  previewBiDashboard(body: BiDashboardPreviewRequest) {
    return apiClient.post<BiDashboardPreviewResponse>('/bi-builder/preview', body);
  },
  getReportBuilder() {
    return apiClient.get<ReportBuilderFoundationResponse>('/report-builder');
  },
  previewReport(body: ReportBuilderPreviewRequest) {
    return apiClient.post<ReportBuilderPreviewResponse>('/report-builder/preview', body);
  },
};
