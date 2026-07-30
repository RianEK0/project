import type {
  ApiSuccessResponse,
  DashboardAudience,
  DashboardBuilderLayoutMode,
  DashboardBuilderRefreshCadence,
  DashboardBuilderWidgetType,
  DashboardSignalTone,
  DashboardTimeWindow,
  SelfServeBuilderStatus,
} from '@nova/shared-types';

import type { SalesDashboardResponse } from './crm';
import type { SalesAnalyticsDashboardResponse } from './sales';
import { apiClient } from './client';

type DashboardRouteLink = {
  label: string;
  route: string;
};

type DashboardScorecardLink = {
  id: string;
  label: string;
  route: string;
};

export type ExecutiveDashboardFoundation = {
  audience: 'EXECUTIVE';
  supportedWindows: DashboardTimeWindow[];
  signals: DashboardSignalTone[];
  scorecards: DashboardScorecardLink[];
  relatedDashboards: DashboardRouteLink[];
};

export type ExecutiveDashboardPreview = {
  audience: 'EXECUTIVE';
  window: 'THIS_MONTH';
  overallSignal: DashboardSignalTone;
  focusArea: string;
  summary: string;
  scorecards: Array<{
    id: string;
    label: string;
    value: number;
    unit: 'PCT' | 'MONTHS';
    tone: DashboardSignalTone;
  }>;
};

export type CeoDashboardFoundation = {
  audience: 'CEO';
  supportedWindows: Array<'THIS_MONTH' | 'THIS_QUARTER' | 'YTD'>;
  signals: DashboardSignalTone[];
  agenda: string[];
  relatedDashboards: DashboardRouteLink[];
};

export type CeoDashboardBriefing = {
  audience: 'CEO';
  window: 'THIS_QUARTER';
  summarySignal: DashboardSignalTone;
  topFocus: string;
  actionBias: string;
  boardSummary: string;
  briefingPoints: string[];
};

export type FinanceDashboardFoundation = {
  audience: 'FINANCE';
  supportedWindows: Array<'TODAY' | 'THIS_MONTH' | 'THIS_QUARTER' | 'YTD'>;
  signals: DashboardSignalTone[];
  scorecards: DashboardScorecardLink[];
  relatedDashboards: DashboardRouteLink[];
};

export type FinanceDashboardScorecard = {
  audience: 'FINANCE';
  window: 'THIS_MONTH';
  overallSignal: DashboardSignalTone;
  runwayMonths: number;
  overdueReceivablePctOfCash: number;
  currentRatio: number;
  budgetVariancePct: number;
  liquiditySignal: DashboardSignalTone;
  receivablesSignal: DashboardSignalTone;
  budgetSignal: DashboardSignalTone;
  focusArea: string;
  summary: string;
};

export type InventoryDashboardFoundation = {
  audience: 'INVENTORY';
  supportedWindows: Array<'TODAY' | 'THIS_WEEK' | 'THIS_MONTH'>;
  signals: DashboardSignalTone[];
  scorecards: DashboardScorecardLink[];
  relatedDashboards: DashboardRouteLink[];
};

export type InventoryDashboardHealth = {
  audience: 'INVENTORY';
  window: 'THIS_MONTH';
  overallSignal: DashboardSignalTone;
  blockedPct: number;
  agingPct: number;
  stockAccuracyPct: number;
  reorderAlerts: number;
  focusArea: string;
  summary: string;
};

export type WarehouseDashboardFoundation = {
  audience: 'WAREHOUSE';
  supportedWindows: Array<'TODAY' | 'THIS_WEEK'>;
  signals: DashboardSignalTone[];
  scorecards: DashboardScorecardLink[];
  relatedDashboards: DashboardRouteLink[];
};

export type WarehouseDashboardControlTower = {
  audience: 'WAREHOUSE';
  window: 'TODAY';
  overallSignal: DashboardSignalTone;
  overdueRate: number;
  flowPressure: 'LOW' | 'MEDIUM' | 'HIGH';
  dispatchReady: number;
  receiptBacklog: number;
  pickingAccuracyPct: number;
  focusArea: string;
  summary: string;
};

export type HrDashboardFoundation = {
  audience: 'HR';
  supportedWindows: Array<'THIS_WEEK' | 'THIS_MONTH' | 'THIS_QUARTER'>;
  signals: DashboardSignalTone[];
  scorecards: DashboardScorecardLink[];
  relatedDashboards: DashboardRouteLink[];
};

export type HrDashboardPeopleOps = {
  audience: 'HR';
  window: 'THIS_MONTH';
  overallSignal: DashboardSignalTone;
  attendanceRatePct: number;
  reviewBacklogPct: number;
  recruitingLoadPct: number;
  trainingCompletionPct: number;
  focusArea: string;
  summary: string;
};

export type ManufacturingDashboardFoundation = {
  audience: 'MANUFACTURING';
  supportedWindows: Array<'THIS_WEEK' | 'THIS_MONTH'>;
  signals: DashboardSignalTone[];
  scorecards: DashboardScorecardLink[];
  relatedDashboards: DashboardRouteLink[];
};

export type ManufacturingDashboardThroughput = {
  audience: 'MANUFACTURING';
  window: 'THIS_WEEK';
  workCenter: string;
  overallSignal: DashboardSignalTone;
  effectiveCapacityHours: number;
  utilizationPct: number;
  firstPassYieldPct: number;
  shortageOrders: number;
  gapHours: number;
  focusArea: string;
  summary: string;
};

export type DashboardBuilderStarterWidget = {
  title: string;
  type: DashboardBuilderWidgetType;
  suggestedAudience: DashboardAudience;
};

export type DashboardBuilderFoundation = {
  items: unknown[];
  statuses: SelfServeBuilderStatus[];
  widgetTypes: DashboardBuilderWidgetType[];
  layoutModes: DashboardBuilderLayoutMode[];
  refreshCadences: DashboardBuilderRefreshCadence[];
  audiences: DashboardAudience[];
  supportedSlots: string[];
  starterWidgets: DashboardBuilderStarterWidget[];
  signalTones: DashboardSignalTone[];
};

export type DashboardBuilderPreviewWidget = {
  id: string;
  title: string;
  type: DashboardBuilderWidgetType;
  slot: string;
  signalTone: DashboardSignalTone;
  insight: string;
};

export type DashboardBuilderPreview = {
  dashboardName: string;
  audience: DashboardAudience;
  layoutMode: DashboardBuilderLayoutMode;
  refreshCadence: DashboardBuilderRefreshCadence;
  status: SelfServeBuilderStatus;
  widgetCount: number;
  nextPublishDate: string;
  summary: string;
  shareTargets: string[];
  operationalFocus: string[];
  guardrails: string[];
  widgets: DashboardBuilderPreviewWidget[];
};

export type DashboardBuilderPreviewRequest = {
  dashboardName: string;
  audience: DashboardAudience;
  layoutMode: DashboardBuilderLayoutMode;
  refreshCadence: DashboardBuilderRefreshCadence;
  widgets: Array<{
    id: string;
    type: DashboardBuilderWidgetType;
    slot: string;
    title: string;
  }>;
};

export type ExecutiveDashboardFoundationResponse = ApiSuccessResponse<ExecutiveDashboardFoundation>;
export type ExecutiveDashboardPreviewResponse = ApiSuccessResponse<ExecutiveDashboardPreview>;
export type CeoDashboardFoundationResponse = ApiSuccessResponse<CeoDashboardFoundation>;
export type CeoDashboardBriefingResponse = ApiSuccessResponse<CeoDashboardBriefing>;
export type FinanceDashboardFoundationResponse = ApiSuccessResponse<FinanceDashboardFoundation>;
export type FinanceDashboardScorecardResponse = ApiSuccessResponse<FinanceDashboardScorecard>;
export type InventoryDashboardFoundationResponse = ApiSuccessResponse<InventoryDashboardFoundation>;
export type InventoryDashboardHealthResponse = ApiSuccessResponse<InventoryDashboardHealth>;
export type WarehouseDashboardFoundationResponse = ApiSuccessResponse<WarehouseDashboardFoundation>;
export type WarehouseDashboardControlTowerResponse =
  ApiSuccessResponse<WarehouseDashboardControlTower>;
export type HrDashboardFoundationResponse = ApiSuccessResponse<HrDashboardFoundation>;
export type HrDashboardPeopleOpsResponse = ApiSuccessResponse<HrDashboardPeopleOps>;
export type ManufacturingDashboardFoundationResponse =
  ApiSuccessResponse<ManufacturingDashboardFoundation>;
export type ManufacturingDashboardThroughputResponse =
  ApiSuccessResponse<ManufacturingDashboardThroughput>;
export type DashboardBuilderFoundationResponse = ApiSuccessResponse<DashboardBuilderFoundation>;
export type DashboardBuilderPreviewResponse = ApiSuccessResponse<DashboardBuilderPreview>;

export const dashboardsApi = {
  getExecutiveDashboard() {
    return apiClient.get<ExecutiveDashboardFoundationResponse>('/executive-dashboard');
  },
  getExecutivePreview() {
    return apiClient.get<ExecutiveDashboardPreviewResponse>('/executive-dashboard/preview');
  },
  getCeoDashboard() {
    return apiClient.get<CeoDashboardFoundationResponse>('/ceo-dashboard');
  },
  getCeoBriefingPreview() {
    return apiClient.get<CeoDashboardBriefingResponse>('/ceo-dashboard/briefing-preview');
  },
  getFinanceDashboard() {
    return apiClient.get<FinanceDashboardFoundationResponse>('/finance-dashboard');
  },
  getFinanceScorecardPreview() {
    return apiClient.get<FinanceDashboardScorecardResponse>('/finance-dashboard/scorecard-preview');
  },
  getInventoryDashboard() {
    return apiClient.get<InventoryDashboardFoundationResponse>('/inventory-dashboard');
  },
  getInventoryHealthPreview() {
    return apiClient.get<InventoryDashboardHealthResponse>('/inventory-dashboard/health-preview');
  },
  getWarehouseDashboard() {
    return apiClient.get<WarehouseDashboardFoundationResponse>('/warehouse-dashboard');
  },
  getWarehouseControlTowerPreview() {
    return apiClient.get<WarehouseDashboardControlTowerResponse>(
      '/warehouse-dashboard/control-tower-preview',
    );
  },
  getHrDashboard() {
    return apiClient.get<HrDashboardFoundationResponse>('/hr-dashboard');
  },
  getHrPeopleOpsPreview() {
    return apiClient.get<HrDashboardPeopleOpsResponse>('/hr-dashboard/people-ops-preview');
  },
  getManufacturingDashboard() {
    return apiClient.get<ManufacturingDashboardFoundationResponse>('/manufacturing-dashboard');
  },
  getManufacturingThroughputPreview() {
    return apiClient.get<ManufacturingDashboardThroughputResponse>(
      '/manufacturing-dashboard/throughput-preview',
    );
  },
  getDashboardBuilder() {
    return apiClient.get<DashboardBuilderFoundationResponse>('/dashboard-builder');
  },
  previewDashboardBuilder(body: DashboardBuilderPreviewRequest) {
    return apiClient.post<DashboardBuilderPreviewResponse>('/dashboard-builder/preview', body);
  },
  getCrmDashboard() {
    return apiClient.get<SalesDashboardResponse>('/sales-dashboard');
  },
  getSalesDashboard() {
    return apiClient.get<SalesAnalyticsDashboardResponse>('/sales-analytics/dashboard');
  },
};
