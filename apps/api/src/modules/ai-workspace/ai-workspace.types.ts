import type {
  AiWorkspaceArea,
  AiWorkspaceCapabilityKey,
  AiWorkspaceCapabilityStatus,
} from '@nova/shared-types';

export type AiWorkspaceCapabilitySummary = {
  key: AiWorkspaceCapabilityKey;
  label: string;
  status: AiWorkspaceCapabilityStatus;
  readinessPct: number;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
  summary: string;
};

export type AiWorkspaceAreaPreview = {
  area: AiWorkspaceArea;
  status: AiWorkspaceCapabilityStatus;
  enabledCapabilities: number;
  capabilitiesExpected: number;
  nextFocus: string;
  summary: string;
  capabilities: AiWorkspaceCapabilitySummary[];
};

export type AiCommandCenterPreview = AiWorkspaceAreaPreview & {
  area: 'COMMAND_CENTER';
  dashboardCoveragePct: number;
  orchestrationCoveragePct: number;
  narrativeCoveragePct: number;
};

export type AiForecastRiskPreview = AiWorkspaceAreaPreview & {
  area: 'FORECAST_RISK';
  forecastCoveragePct: number;
  anomalyCoveragePct: number;
  financeSignalCoveragePct: number;
};

export type AiOptimizationPreview = AiWorkspaceAreaPreview & {
  area: 'OPTIMIZATION';
  recommendationCoveragePct: number;
  executionLinkagePct: number;
  crossDomainCoveragePct: number;
};

export type AiDocumentIntelligencePreview = AiWorkspaceAreaPreview & {
  area: 'DOCUMENT_INTELLIGENCE';
  extractionCoveragePct: number;
  confidenceCoveragePct: number;
  reviewGovernancePct: number;
};

export type AiPerceptionPreview = AiWorkspaceAreaPreview & {
  area: 'PERCEPTION';
  visualCoveragePct: number;
  countingAccuracyPct: number;
  safetyCompliancePct: number;
};

export type AiAssistantsPreview = AiWorkspaceAreaPreview & {
  area: 'ASSISTANTS';
  voiceCoveragePct: number;
  transcriptGovernancePct: number;
  followUpCapturePct: number;
};
