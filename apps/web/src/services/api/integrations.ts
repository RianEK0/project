import type {
  ApiSuccessResponse,
  IntegrationAuthMode,
  IntegrationConnectionStatus,
  IntegrationProviderCategory,
  IntegrationProviderKey,
} from '@nova/shared-types';

import { apiClient } from './client';

type IntegrationRouteLink = {
  label: string;
  route: string;
};

type IntegrationWorkspaceCard = {
  id: string;
  label: string;
  route: string;
  description: string;
};

type FeaturedIntegrationProvider = {
  key: IntegrationProviderKey;
  label: string;
  route: string;
  category: IntegrationProviderCategory;
};

export type IntegrationWorkspaceFoundation = {
  providers: IntegrationProviderKey[];
  categories: IntegrationProviderCategory[];
  statuses: IntegrationConnectionStatus[];
  authModes: IntegrationAuthMode[];
  cards: IntegrationWorkspaceCard[];
  featuredProviders: FeaturedIntegrationProvider[];
  relatedRoutes: IntegrationRouteLink[];
};

export type IntegrationProviderPreview = {
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

type IntegrationCategoryPreview = {
  category: IntegrationProviderCategory;
  status: IntegrationConnectionStatus;
  connectedProviders: number;
  providersExpected: number;
  nextFocus: string;
  summary: string;
  providers: IntegrationProviderPreview[];
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

export type IntegrationWorkspaceFoundationResponse =
  ApiSuccessResponse<IntegrationWorkspaceFoundation>;
export type PaymentsIntegrationPreviewResponse = ApiSuccessResponse<PaymentsIntegrationPreview>;
export type SuiteIntegrationPreviewResponse = ApiSuccessResponse<SuiteIntegrationPreview>;
export type MessagingIntegrationPreviewResponse = ApiSuccessResponse<MessagingIntegrationPreview>;
export type StorageIntegrationPreviewResponse = ApiSuccessResponse<StorageIntegrationPreview>;
export type AiIntegrationPreviewResponse = ApiSuccessResponse<AiIntegrationPreview>;

export const integrationsApi = {
  getWorkspace() {
    return apiClient.get<IntegrationWorkspaceFoundationResponse>('/integrations-workspace');
  },
  getPaymentsPreview() {
    return apiClient.get<PaymentsIntegrationPreviewResponse>(
      '/integrations-workspace/payments-preview',
    );
  },
  getSuitePreview() {
    return apiClient.get<SuiteIntegrationPreviewResponse>('/integrations-workspace/suite-preview');
  },
  getMessagingPreview() {
    return apiClient.get<MessagingIntegrationPreviewResponse>(
      '/integrations-workspace/messaging-preview',
    );
  },
  getStoragePreview() {
    return apiClient.get<StorageIntegrationPreviewResponse>(
      '/integrations-workspace/storage-preview',
    );
  },
  getAiPreview() {
    return apiClient.get<AiIntegrationPreviewResponse>('/integrations-workspace/ai-preview');
  },
};
