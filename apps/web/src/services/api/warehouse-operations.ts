import type {
  ApiSuccessResponse,
  InventoryAllocationStatus,
  InventoryAllocationStrategy,
  InventoryMovementStatus,
  InventoryMovementType,
  ScanType,
  StockCountStatus,
  WarehouseTaskStatus,
} from '@nova/shared-types';

import { apiClient } from './client';

export type InventoryMovementMetadata = {
  approvalRequiredTypes: InventoryMovementType[];
  terminalStatuses: InventoryMovementStatus[];
  transitions: Record<InventoryMovementStatus, InventoryMovementStatus[]>;
};

export type InventoryAllocationStrategyPreview = {
  status: InventoryAllocationStatus;
  requestedQuantity: number;
  allocatedQuantity: number;
  shortageQuantity: number;
  allocations: Array<{
    candidateId: string;
    inventoryBalanceId: string | null;
    quantity: number;
  }>;
};

export type InventoryAllocationStrategyPreviewRequest = {
  requiredQuantity: number | string;
  strategy: InventoryAllocationStrategy;
  allowPartial?: boolean;
  preferredCandidateIds?: string[];
  asOf?: string;
  candidates: Array<{
    id: string;
    inventoryBalanceId?: string | null;
    availableQuantity: number | string;
    inventoryStatus: 'AVAILABLE' | 'RESERVED' | 'QUARANTINE' | 'DAMAGED' | 'EXPIRED' | 'BLOCKED';
    receivedAt?: string | null;
    expirationDate?: string | null;
    locationPriority?: number | null;
  }>;
};

export type WarehouseTaskWorkload = {
  buckets: Array<{
    status: WarehouseTaskStatus;
    count: number;
  }>;
};

export type WarehouseScanResolution = {
  scanType: ScanType;
  entityType: string;
  value: string;
  normalizedCode: string;
};

export type InventoryMovementAnalyticsDashboard = {
  summary: {
    movementTypes: number;
    movementStatuses: number;
    receiptStages: number;
    transferStages: number;
    stockCountStages: number;
  };
  dashboards: Array<{
    id: string;
    label: string;
    description: string;
  }>;
};

export type InventoryMovementReportsCatalog = {
  reports: Array<{
    id: string;
    label: string;
    description: string;
  }>;
};

export type StockCountMetadata = {
  freezeBlockingStatuses: StockCountStatus[];
  transitions: Record<StockCountStatus, StockCountStatus[]>;
};

export type InventoryMovementMetadataResponse = ApiSuccessResponse<InventoryMovementMetadata>;
export type InventoryAllocationStrategyPreviewResponse =
  ApiSuccessResponse<InventoryAllocationStrategyPreview>;
export type WarehouseTaskWorkloadResponse = ApiSuccessResponse<WarehouseTaskWorkload>;
export type WarehouseScanResolutionResponse = ApiSuccessResponse<WarehouseScanResolution>;
export type InventoryMovementAnalyticsDashboardResponse =
  ApiSuccessResponse<InventoryMovementAnalyticsDashboard>;
export type InventoryMovementReportsCatalogResponse =
  ApiSuccessResponse<InventoryMovementReportsCatalog>;
export type StockCountMetadataResponse = ApiSuccessResponse<StockCountMetadata>;

export const warehouseOperationsApi = {
  getMovementMetadata() {
    return apiClient.get<InventoryMovementMetadataResponse>('/inventory-movements/metadata');
  },
  previewAllocationStrategy(body: InventoryAllocationStrategyPreviewRequest) {
    return apiClient.post<InventoryAllocationStrategyPreviewResponse>(
      '/inventory-allocations/strategy-preview',
      body,
    );
  },
  getTaskWorkload() {
    return apiClient.get<WarehouseTaskWorkloadResponse>('/warehouse-tasks/workload');
  },
  resolveScan(code: string) {
    return apiClient.get<WarehouseScanResolutionResponse>(
      `/scan/resolve/${encodeURIComponent(code)}`,
    );
  },
  getAnalyticsDashboard() {
    return apiClient.get<InventoryMovementAnalyticsDashboardResponse>(
      '/inventory-movement-analytics/dashboard',
    );
  },
  getReportCatalog() {
    return apiClient.get<InventoryMovementReportsCatalogResponse>(
      '/inventory-movement-reports/catalog',
    );
  },
  getStockCountMetadata() {
    return apiClient.get<StockCountMetadataResponse>('/stock-counts/metadata');
  },
};
