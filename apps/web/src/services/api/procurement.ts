import type {
  ApiSuccessResponse,
  PurchaseOrderStatus,
  PurchaseRequestStatus,
  VendorLeadTimeTrend,
  VendorRatingLevel,
} from '@nova/shared-types';

import { apiClient } from './client';

export type PurchaseRequestMetadata = {
  transitions: Record<PurchaseRequestStatus, PurchaseRequestStatus[]>;
  sourceTypes: string[];
};

export type PurchaseOrderMetadata = {
  transitions: Record<PurchaseOrderStatus, PurchaseOrderStatus[]>;
  invoicePreparationStatuses: string[];
};

export type VendorComparisonPreviewRequest = {
  quotations: Array<{
    quotationId: string;
    supplierId: string;
    supplierName: string;
    unitPrice: number | string;
    leadTimeDays: number;
    qualityScore?: number;
    onTimeRate?: number;
  }>;
  weights?: {
    price?: number;
    leadTime?: number;
    quality?: number;
    onTime?: number;
  };
};

export type VendorComparisonPreview = {
  recommendedQuotationId: string;
  rankings: Array<{
    quotationId: string;
    supplierId: string;
    supplierName: string;
    totalScore: number;
    rank: number;
    recommended: boolean;
    rationale: string[];
  }>;
};

export type VendorPerformanceEvaluationRequest = {
  receipts: Array<{
    leadTimeDays: number | string;
    promisedLeadTimeDays?: number | string | null;
    quotedUnitPrice?: number | string | null;
    actualUnitPrice?: number | string | null;
    receivedQuantity: number | string;
    rejectedQuantity?: number | string | null;
  }>;
  previousAverageLeadTimeDays?: number | string;
};

export type VendorPerformanceSummary = {
  averageLeadTimeDays: number;
  onTimeRate: number;
  averagePriceVariancePct: number;
  acceptanceRate: number;
  ratingLevel: VendorRatingLevel;
  leadTimeTrend: VendorLeadTimeTrend;
};

export type PurchaseAnalyticsDashboard = {
  cards: Array<{
    id: string;
    label: string;
    stages: number;
  }>;
};

export type PurchaseRequestMetadataResponse = ApiSuccessResponse<PurchaseRequestMetadata>;
export type PurchaseOrderMetadataResponse = ApiSuccessResponse<PurchaseOrderMetadata>;
export type VendorComparisonPreviewResponse = ApiSuccessResponse<VendorComparisonPreview>;
export type VendorPerformanceSummaryResponse = ApiSuccessResponse<VendorPerformanceSummary>;
export type PurchaseAnalyticsDashboardResponse = ApiSuccessResponse<PurchaseAnalyticsDashboard>;

export const procurementApi = {
  getPurchaseRequestMetadata() {
    return apiClient.get<PurchaseRequestMetadataResponse>('/purchase-requests/metadata');
  },
  getPurchaseOrderMetadata() {
    return apiClient.get<PurchaseOrderMetadataResponse>('/purchase-orders/metadata');
  },
  previewVendorComparison(body: VendorComparisonPreviewRequest) {
    return apiClient.post<VendorComparisonPreviewResponse>('/vendor-comparisons/preview', body);
  },
  evaluateVendorPerformance(body: VendorPerformanceEvaluationRequest) {
    return apiClient.post<VendorPerformanceSummaryResponse>('/vendor-performance/evaluate', body);
  },
  getPurchaseAnalyticsDashboard() {
    return apiClient.get<PurchaseAnalyticsDashboardResponse>('/purchase-analytics/dashboard');
  },
};
