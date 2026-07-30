import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  mobileCapabilityKeys,
  mobileCapabilityStatuses,
  mobileSurfaceTypes,
  themeModes,
} from '@nova/shared-types';

import { MobileOfflineSyncService } from './mobile-offline-sync.service';
import { MobilePwaReadinessService } from './mobile-pwa-readiness.service';
import { MobileWarehouseUiService } from './mobile-warehouse-ui.service';

@ApiTags('Mobile Workspace')
@Controller({
  path: 'mobile-workspace',
  version: '1',
})
export class MobileWorkspaceController {
  constructor(
    private readonly mobilePwaReadinessService: MobilePwaReadinessService,
    private readonly mobileOfflineSyncService: MobileOfflineSyncService,
    private readonly mobileWarehouseUiService: MobileWarehouseUiService,
  ) {}

  @Get()
  getWorkspace() {
    return {
      capabilities: mobileCapabilityKeys,
      surfaces: mobileSurfaceTypes,
      statuses: mobileCapabilityStatuses,
      themeModes,
      cards: [
        {
          id: 'pwa',
          label: 'PWA',
          route: '/app/mobile/pwa',
          description: 'Installable shell with manifest and service worker coverage.',
        },
        {
          id: 'offline-sync',
          label: 'Offline Sync',
          route: '/app/mobile/offline-sync',
          description: 'Queue, replay, and conflict-handling foundation for field execution.',
        },
        {
          id: 'scanning',
          label: 'Barcode And QR',
          route: '/app/mobile/barcode',
          description: 'Scanning-first workflows for handheld and tablet surfaces.',
        },
        {
          id: 'warehouse-ui',
          label: 'Warehouse UI',
          route: '/app/mobile/warehouse-ui',
          description: 'Touch-sized task, scan, and acknowledgement flows for operators.',
        },
      ],
      relatedRoutes: [
        { label: 'Warehouse Scan', route: '/app/warehouse-operations/scan' },
        { label: 'My Warehouse Tasks', route: '/app/warehouse-operations/tasks/my-tasks' },
        { label: 'Inventory Dashboard', route: '/app/dashboards/inventory' },
      ],
    };
  }

  @Get('pwa-preview')
  getPwaPreview() {
    return this.mobilePwaReadinessService.previewReadiness({
      coreScreens: 6,
      offlineReadyScreens: 4,
      expectedShortcuts: 4,
      configuredShortcuts: 3,
      manifestEnabled: true,
      serviceWorkerEnabled: true,
      pushEnabled: false,
    });
  }

  @Get('offline-sync-preview')
  getOfflineSyncPreview() {
    return this.mobileOfflineSyncService.previewSync({
      pendingOperations: 18,
      conflictCount: 0,
      oldestPendingMinutes: 12,
      replaySuccessRatePct: 94,
      lowBatteryModeEnabled: false,
    });
  }

  @Get('warehouse-ui-preview')
  getWarehouseUiPreview() {
    return this.mobileWarehouseUiService.previewSurface({
      scanSuccessRatePct: 94.8,
      averagePickSeconds: 61,
      deviceBatteryPct: 72,
      gpsCoveragePct: 86,
      pushAcknowledgeMinutes: 7,
      tabletUtilizationPct: 64,
    });
  }
}
