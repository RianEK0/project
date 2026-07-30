import type {
  IntegrationAuthMode,
  IntegrationConnectionStatus,
  IntegrationProviderCategory,
  IntegrationProviderKey,
} from '@nova/shared-types';

export type IntegrationProviderSummary = {
  key: IntegrationProviderKey;
  label: string;
  status: IntegrationConnectionStatus;
  authModes: IntegrationAuthMode[];
  readinessPct: number;
  routeCount: number;
  primaryUseCase: string;
  nextFocus: string;
  summary: string;
};

export type IntegrationCategoryPreview = {
  category: IntegrationProviderCategory;
  status: IntegrationConnectionStatus;
  connectedProviders: number;
  providersExpected: number;
  nextFocus: string;
  summary: string;
  providers: IntegrationProviderSummary[];
};

export type PaymentsIntegrationPreview = IntegrationCategoryPreview & {
  category: 'PAYMENT';
  webhookCoveragePct: number;
  settlementMatchRatePct: number;
  ledgerRoutingCoveragePct: number;
};

export type SuiteIntegrationPreview = IntegrationCategoryPreview & {
  category: 'SUITE';
  directorySyncCoveragePct: number;
  calendarSyncCoveragePct: number;
  documentCollaborationCoveragePct: number;
};

export type MessagingIntegrationPreview = IntegrationCategoryPreview & {
  category: 'MESSAGING';
  deliveryVisibilityPct: number;
  automationBindingPct: number;
  incomingWebhookCoveragePct: number;
};

export type StorageIntegrationPreview = IntegrationCategoryPreview & {
  category: 'STORAGE';
  retentionCoveragePct: number;
  signedUrlCoveragePct: number;
  backupRedundancyPct: number;
};

export type AiIntegrationPreview = IntegrationCategoryPreview & {
  category: 'AI';
  promptGovernancePct: number;
  fallbackCoveragePct: number;
  modelRoutingCoveragePct: number;
};
