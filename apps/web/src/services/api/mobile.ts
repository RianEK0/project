import type {
  ApiSuccessResponse,
  MobileCapabilityKey,
  MobileCapabilityStatus,
  MobileSurfaceType,
  OfflineSyncStatus,
  ThemeMode,
} from '@nova/shared-types';

import { apiClient } from './client';

export type MobileWorkspaceFoundation = {
  capabilities: MobileCapabilityKey[];
  surfaces: MobileSurfaceType[];
  statuses: MobileCapabilityStatus[];
  themeModes: ThemeMode[];
  cards: Array<{
    id: string;
    label: string;
    route: string;
    description: string;
  }>;
  relatedRoutes: Array<{
    label: string;
    route: string;
  }>;
};

export type MobilePwaReadinessPreview = {
  status: MobileCapabilityStatus;
  installable: boolean;
  manifestEnabled: boolean;
  serviceWorkerEnabled: boolean;
  pushEnabled: boolean;
  offlineCoveragePct: number;
  shortcutCoveragePct: number;
  nextFocus: string;
  summary: string;
};

export type MobileOfflineSyncPreview = {
  status: OfflineSyncStatus;
  queueDepth: number;
  conflictCount: number;
  oldestPendingMinutes: number;
  replaySuccessRatePct: number;
  syncPressure: 'LOW' | 'MEDIUM' | 'HIGH';
  nextFocus: string;
  summary: string;
};

export type MobileWarehouseUiPreview = {
  status: MobileCapabilityStatus;
  supportedSurfaces: MobileSurfaceType[];
  scanSuccessRatePct: number;
  averagePickSeconds: number;
  deviceBatteryPct: number;
  gpsCoveragePct: number;
  pushAcknowledgeMinutes: number;
  tabletUtilizationPct: number;
  nextFocus: string;
  summary: string;
};

export type MobileWorkspaceFoundationResponse = ApiSuccessResponse<MobileWorkspaceFoundation>;
export type MobilePwaReadinessPreviewResponse = ApiSuccessResponse<MobilePwaReadinessPreview>;
export type MobileOfflineSyncPreviewResponse = ApiSuccessResponse<MobileOfflineSyncPreview>;
export type MobileWarehouseUiPreviewResponse = ApiSuccessResponse<MobileWarehouseUiPreview>;

export const mobileApi = {
  getWorkspace() {
    return apiClient.get<MobileWorkspaceFoundationResponse>('/mobile-workspace');
  },
  getPwaPreview() {
    return apiClient.get<MobilePwaReadinessPreviewResponse>('/mobile-workspace/pwa-preview');
  },
  getOfflineSyncPreview() {
    return apiClient.get<MobileOfflineSyncPreviewResponse>(
      '/mobile-workspace/offline-sync-preview',
    );
  },
  getWarehouseUiPreview() {
    return apiClient.get<MobileWarehouseUiPreviewResponse>(
      '/mobile-workspace/warehouse-ui-preview',
    );
  },
};
