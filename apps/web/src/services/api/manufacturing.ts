import type {
  ApiSuccessResponse,
  BillOfMaterialStatus,
  BomLineType,
  CapacityPlanningStatus,
  MachineStatus,
  MachineType,
  MaintenanceStatus,
  MaintenanceType,
  MrpExceptionType,
  MrpStatus,
  ProductionPlanningStatus,
  ProductionStatus,
  QualityControlStatus,
  QualityDecisionType,
  RoutingOperationType,
  RoutingStatus,
  ScrapReasonType,
  WorkOrderStatus,
} from '@nova/shared-types';

import { apiClient } from './client';

export type BillOfMaterialFoundation = {
  items: unknown[];
  statuses: BillOfMaterialStatus[];
  lineTypes: BomLineType[];
  revisionControls: string[];
};

export type BomExplosionPreview = Array<{
  componentCode: string;
  lineType: BomLineType;
  totalQuantity: number;
}>;

export type ProductionFoundation = {
  items: unknown[];
  statuses: ProductionStatus[];
  orderTypes: string[];
  downstreamDocuments: string[];
};

export type WorkOrderFoundation = {
  items: unknown[];
  statuses: WorkOrderStatus[];
  executionSignals: string[];
  schedulingModes: string[];
};

export type RoutingFoundation = {
  items: unknown[];
  statuses: RoutingStatus[];
  operationTypes: RoutingOperationType[];
  timeBases: string[];
};

export type MachineFoundation = {
  items: unknown[];
  statuses: MachineStatus[];
  machineTypes: MachineType[];
  availabilitySignals: string[];
};

export type MaintenanceFoundation = {
  items: unknown[];
  statuses: MaintenanceStatus[];
  maintenanceTypes: MaintenanceType[];
  triggers: string[];
};

export type QualityControlFoundation = {
  items: unknown[];
  statuses: QualityControlStatus[];
  decisionTypes: QualityDecisionType[];
  inspectionPoints: string[];
};

export type ScrapFoundation = {
  items: unknown[];
  reasonTypes: ScrapReasonType[];
  controls: string[];
  linkedViews: string[];
};

export type ProductionPlanningFoundation = {
  items: unknown[];
  statuses: ProductionPlanningStatus[];
  planningHorizons: string[];
  releaseRules: string[];
};

export type MrpFoundation = {
  items: unknown[];
  statuses: MrpStatus[];
  exceptionTypes: MrpExceptionType[];
  supplySources: string[];
};

export type MrpNetRequirementPreview = {
  itemCode: string;
  status: Exclude<MrpStatus, 'RUNNING'>;
  exceptionType: MrpExceptionType;
  availableAfterSafetyStock: number;
  netRequirement: number;
  plannedOrderReceipt: number;
};

export type CapacityPlanningFoundation = {
  items: unknown[];
  statuses: CapacityPlanningStatus[];
  bucketTypes: string[];
  balancingLevers: string[];
};

export type CapacityLoadPreview = {
  workCenter: string;
  status: CapacityPlanningStatus;
  effectiveCapacityHours: number;
  plannedHours: number;
  utilizationRate: number;
  gapHours: number;
};

export type BillOfMaterialFoundationResponse = ApiSuccessResponse<BillOfMaterialFoundation>;
export type BomExplosionPreviewResponse = ApiSuccessResponse<BomExplosionPreview>;
export type ProductionFoundationResponse = ApiSuccessResponse<ProductionFoundation>;
export type WorkOrderFoundationResponse = ApiSuccessResponse<WorkOrderFoundation>;
export type RoutingFoundationResponse = ApiSuccessResponse<RoutingFoundation>;
export type MachineFoundationResponse = ApiSuccessResponse<MachineFoundation>;
export type MaintenanceFoundationResponse = ApiSuccessResponse<MaintenanceFoundation>;
export type QualityControlFoundationResponse = ApiSuccessResponse<QualityControlFoundation>;
export type ScrapFoundationResponse = ApiSuccessResponse<ScrapFoundation>;
export type ProductionPlanningFoundationResponse = ApiSuccessResponse<ProductionPlanningFoundation>;
export type MrpFoundationResponse = ApiSuccessResponse<MrpFoundation>;
export type MrpNetRequirementPreviewResponse = ApiSuccessResponse<MrpNetRequirementPreview>;
export type CapacityPlanningFoundationResponse = ApiSuccessResponse<CapacityPlanningFoundation>;
export type CapacityLoadPreviewResponse = ApiSuccessResponse<CapacityLoadPreview>;

export const manufacturingApi = {
  getBillOfMaterials() {
    return apiClient.get<BillOfMaterialFoundationResponse>('/bill-of-materials');
  },
  getBomExplosionPreview() {
    return apiClient.get<BomExplosionPreviewResponse>('/bill-of-materials/explosion-preview');
  },
  getProduction() {
    return apiClient.get<ProductionFoundationResponse>('/production');
  },
  getWorkOrders() {
    return apiClient.get<WorkOrderFoundationResponse>('/work-orders');
  },
  getRouting() {
    return apiClient.get<RoutingFoundationResponse>('/routing');
  },
  getMachines() {
    return apiClient.get<MachineFoundationResponse>('/machines');
  },
  getMaintenance() {
    return apiClient.get<MaintenanceFoundationResponse>('/maintenance');
  },
  getQualityControl() {
    return apiClient.get<QualityControlFoundationResponse>('/quality-control');
  },
  getScrap() {
    return apiClient.get<ScrapFoundationResponse>('/scrap');
  },
  getProductionPlanning() {
    return apiClient.get<ProductionPlanningFoundationResponse>('/production-planning');
  },
  getMrp() {
    return apiClient.get<MrpFoundationResponse>('/mrp');
  },
  getMrpNetRequirementPreview() {
    return apiClient.get<MrpNetRequirementPreviewResponse>('/mrp/net-requirement-preview');
  },
  getCapacityPlanning() {
    return apiClient.get<CapacityPlanningFoundationResponse>('/capacity-planning');
  },
  getCapacityLoadPreview() {
    return apiClient.get<CapacityLoadPreviewResponse>('/capacity-planning/load-preview');
  },
};
