import type {
  AnalyticsWorkspaceArea,
  AnalyticsWorkspaceCapabilityKey,
  AnalyticsWorkspaceCapabilityStatus,
} from '@nova/shared-types';

export type AnalyticsWorkspaceCapabilitySummary = {
  key: AnalyticsWorkspaceCapabilityKey;
  label: string;
  status: AnalyticsWorkspaceCapabilityStatus;
  readinessPct: number;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
  summary: string;
};

export type AnalyticsWorkspaceAreaPreview = {
  area: AnalyticsWorkspaceArea;
  status: AnalyticsWorkspaceCapabilityStatus;
  enabledCapabilities: number;
  capabilitiesExpected: number;
  nextFocus: string;
  summary: string;
  capabilities: AnalyticsWorkspaceCapabilitySummary[];
};

export type AnalyticsDomainOperationsPreview = AnalyticsWorkspaceAreaPreview & {
  area: 'DOMAIN_OPERATIONS';
  domainCoveragePct: number;
  dashboardAlignmentPct: number;
  crossProcessCoveragePct: number;
};

export type AnalyticsEntityIntelligencePreview = AnalyticsWorkspaceAreaPreview & {
  area: 'ENTITY_INTELLIGENCE';
  customerCoveragePct: number;
  supplierCoveragePct: number;
  warehouseCoveragePct: number;
};

export type AnalyticsSemanticModelPreview = AnalyticsWorkspaceAreaPreview & {
  area: 'SEMANTIC_MODEL';
  factCoveragePct: number;
  dimensionCoveragePct: number;
  cubeReadinessPct: number;
};

export type AnalyticsRealtimePreview = AnalyticsWorkspaceAreaPreview & {
  area: 'REALTIME';
  streamCoveragePct: number;
  freshnessSlaPct: number;
  alertCoveragePct: number;
};
