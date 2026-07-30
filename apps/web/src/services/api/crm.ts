import type {
  ApiSuccessResponse,
  CustomerTimelineEventType,
  LeadStatus,
  SalesCommunicationChannel,
  SalesDashboardPeriod,
  SalesPipelineStage,
  SalesQuotationStatus,
} from '@nova/shared-types';

import { apiClient } from './client';

export type LeadMetadata = {
  transitions: Record<LeadStatus, LeadStatus[]>;
  sources: string[];
  convertibleStatuses: LeadStatus[];
};

export type SalesQuotationMetadata = {
  transitions: Record<SalesQuotationStatus, SalesQuotationStatus[]>;
  convertibleStatuses: string[];
};

export type SalesPipelinePreviewRequest = {
  snapshot: Array<{
    stage: SalesPipelineStage;
    openCount: number | string;
    openValue?: number | string | null;
    probabilityPct?: number | string | null;
    stalledDays?: number | string | null;
  }>;
};

export type SalesPipelineSummary = {
  totalOpenCount: number;
  totalOpenValue: number;
  weightedOpenValue: number;
  winRate: number;
  stalledStage: SalesPipelineStage | null;
  stageMix: Array<{
    stage: SalesPipelineStage;
    openCount: number;
    openValue: number;
    weightedValue: number;
    stalledDays: number;
  }>;
};

export type CustomerTimelinePreviewRequest = {
  entries: Array<{
    id: string;
    occurredAt: string;
    type: CustomerTimelineEventType;
    actorName?: string | null;
    channel?: SalesCommunicationChannel | null;
    note?: string | null;
  }>;
};

export type CustomerTimelineSummary = {
  totalEntries: number;
  entries: Array<{
    id: string;
    occurredAt: string;
    type: CustomerTimelineEventType;
    actorName: string | null;
    channel: SalesCommunicationChannel | null;
    note: string | null;
  }>;
  channelCounts: Record<SalesCommunicationChannel, number>;
};

export type SalesDashboard = {
  periods: SalesDashboardPeriod[];
  cards: Array<{
    id: string;
    label: string;
    route: string;
    insight: string;
  }>;
};

export type LeadMetadataResponse = ApiSuccessResponse<LeadMetadata>;
export type SalesQuotationMetadataResponse = ApiSuccessResponse<SalesQuotationMetadata>;
export type SalesPipelineSummaryResponse = ApiSuccessResponse<SalesPipelineSummary>;
export type CustomerTimelineSummaryResponse = ApiSuccessResponse<CustomerTimelineSummary>;
export type SalesDashboardResponse = ApiSuccessResponse<SalesDashboard>;

export const crmApi = {
  getLeadMetadata() {
    return apiClient.get<LeadMetadataResponse>('/leads/metadata');
  },
  getSalesQuotationMetadata() {
    return apiClient.get<SalesQuotationMetadataResponse>('/sales-quotations/metadata');
  },
  previewSalesPipeline(body: SalesPipelinePreviewRequest) {
    return apiClient.post<SalesPipelineSummaryResponse>('/sales-pipeline/preview', body);
  },
  previewCustomerTimeline(body: CustomerTimelinePreviewRequest) {
    return apiClient.post<CustomerTimelineSummaryResponse>('/customer-timeline/preview', body);
  },
  getSalesDashboard() {
    return apiClient.get<SalesDashboardResponse>('/sales-dashboard');
  },
};
