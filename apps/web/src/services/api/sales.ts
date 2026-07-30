import type {
  ApiSuccessResponse,
  CustomerCreditRiskLevel,
  DeliveryOrderStatus,
  DiscountRuleType,
  DiscountTarget,
  InstallmentFrequency,
  SalesAnalyticsPeriod,
  SalesOrderSourceType,
  SalesOrderStatus,
  SalesReturnStatus,
  TaxCalculationMode,
} from '@nova/shared-types';

import { apiClient } from './client';

export type SalesOrderMetadata = {
  transitions: Record<SalesOrderStatus, SalesOrderStatus[]>;
  sourceTypes: SalesOrderSourceType[];
  invoiceReadyStatuses: SalesOrderStatus[];
};

export type DeliveryOrderMetadata = {
  transitions: Record<DeliveryOrderStatus, DeliveryOrderStatus[]>;
  dispatchReadyStatuses: string[];
};

export type SalesReturnMetadata = {
  transitions: Record<SalesReturnStatus, SalesReturnStatus[]>;
  creditNoteEligibleStatuses: SalesReturnStatus[];
};

export type DiscountEvaluationRequest = {
  lines: Array<{
    lineId: string;
    quantity: number;
    unitPrice: number;
  }>;
  rules: Array<{
    ruleId: string;
    ruleType: DiscountRuleType;
    target: DiscountTarget;
    value: number;
    minQuantity?: number;
    buyQuantity?: number;
    freeQuantity?: number;
    maxDiscountAmount?: number;
  }>;
};

export type DiscountEvaluation = {
  subtotal: number;
  lineDiscountTotal: number;
  orderDiscountTotal: number;
  grandDiscountTotal: number;
  lineSummaries: Array<{
    lineId: string;
    subtotal: number;
    discount: number;
  }>;
  appliedRuleIds: string[];
};

export type TaxEvaluationRequest = {
  lines: Array<{
    lineId: string;
    taxableAmount: number;
    ratePct: number;
    mode: TaxCalculationMode;
  }>;
};

export type TaxEvaluation = {
  totals: {
    netAmount: number;
    taxAmount: number;
    grossAmount: number;
  };
  lines: Array<{
    lineId: string;
    netAmount: number;
    taxAmount: number;
    grossAmount: number;
    mode: TaxCalculationMode;
  }>;
};

export type CustomerCreditPreviewRequest = {
  creditLimit: number | string;
  openOrderAmount: number | string;
  openInvoiceAmount: number | string;
  pendingPaymentAmount?: number | string | null;
  overdueAmount?: number | string | null;
  requestedOrderAmount?: number | string | null;
};

export type CustomerCreditPreview = {
  creditLimit: number;
  totalExposure: number;
  availableCredit: number;
  utilizationPct: number;
  overdueAmount: number;
  riskLevel: CustomerCreditRiskLevel;
  canApproveRequestedOrder: boolean;
};

export type InstallmentPreviewRequest = {
  principalAmount: number;
  installmentCount: number;
  firstDueDate: string;
  frequency: InstallmentFrequency;
};

export type InstallmentPreview = {
  totalAmount: number;
  schedule: Array<{
    installmentNumber: number;
    dueDate: string;
    amount: number;
  }>;
};

export type SalesAnalyticsDashboard = {
  periods: SalesAnalyticsPeriod[];
  summary: {
    fillRate: number;
    invoiceRate: number;
    returnRate: number;
    collectionRate: number;
    openOrderValue: number;
    overdueReceivable: number;
    riskSignal: 'HEALTHY' | 'WATCH' | 'AT_RISK';
  };
  cards: Array<{
    id: string;
    label: string;
    route: string;
    metric: number;
  }>;
};

export type SalesOrderMetadataResponse = ApiSuccessResponse<SalesOrderMetadata>;
export type DeliveryOrderMetadataResponse = ApiSuccessResponse<DeliveryOrderMetadata>;
export type SalesReturnMetadataResponse = ApiSuccessResponse<SalesReturnMetadata>;
export type DiscountEvaluationResponse = ApiSuccessResponse<DiscountEvaluation>;
export type TaxEvaluationResponse = ApiSuccessResponse<TaxEvaluation>;
export type CustomerCreditPreviewResponse = ApiSuccessResponse<CustomerCreditPreview>;
export type InstallmentPreviewResponse = ApiSuccessResponse<InstallmentPreview>;
export type SalesAnalyticsDashboardResponse = ApiSuccessResponse<SalesAnalyticsDashboard>;

export const salesApi = {
  getSalesOrderMetadata() {
    return apiClient.get<SalesOrderMetadataResponse>('/sales-orders/metadata');
  },
  getDeliveryOrderMetadata() {
    return apiClient.get<DeliveryOrderMetadataResponse>('/delivery-orders/metadata');
  },
  getSalesReturnMetadata() {
    return apiClient.get<SalesReturnMetadataResponse>('/sales-returns/metadata');
  },
  evaluateDiscount(body: DiscountEvaluationRequest) {
    return apiClient.post<DiscountEvaluationResponse>('/discount-engine/evaluate', body);
  },
  evaluateTax(body: TaxEvaluationRequest) {
    return apiClient.post<TaxEvaluationResponse>('/tax-engine/evaluate', body);
  },
  previewCustomerCredit(body: CustomerCreditPreviewRequest) {
    return apiClient.post<CustomerCreditPreviewResponse>('/customer-credit/preview', body);
  },
  previewInstallment(body: InstallmentPreviewRequest) {
    return apiClient.post<InstallmentPreviewResponse>('/installments/preview', body);
  },
  getSalesAnalyticsDashboard() {
    return apiClient.get<SalesAnalyticsDashboardResponse>('/sales-analytics/dashboard');
  },
};
