import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { dashboardSignalTones } from '@nova/shared-types';

import { WarehouseDashboardControlTowerService } from './warehouse-dashboard-control-tower.service';

@ApiTags('Warehouse Dashboard')
@Controller({
  path: 'warehouse-dashboard',
  version: '1',
})
export class WarehouseDashboardController {
  constructor(
    private readonly warehouseDashboardControlTowerService: WarehouseDashboardControlTowerService,
  ) {}

  @Get()
  getDashboard() {
    return {
      audience: 'WAREHOUSE',
      supportedWindows: ['TODAY', 'THIS_WEEK'],
      signals: dashboardSignalTones,
      scorecards: [
        { id: 'tasks', label: 'Open Task Queue', route: '/app/warehouse-operations/tasks' },
        { id: 'receipts', label: 'Receipt Backlog', route: '/app/warehouse-operations/receipts' },
        {
          id: 'dispatch',
          label: 'Dispatch Readiness',
          route: '/app/warehouse-operations/dispatch',
        },
        { id: 'accuracy', label: 'Picking Accuracy', route: '/app/warehouse-operations/picking' },
      ],
      relatedDashboards: [
        { label: 'Inventory Dashboard', route: '/app/dashboards/inventory' },
        { label: 'Warehouse Operations', route: '/app/warehouse-operations/dashboard' },
      ],
    };
  }

  @Get('control-tower-preview')
  getControlTowerPreview() {
    return this.warehouseDashboardControlTowerService.previewTower({
      openTasks: 28,
      overdueTasks: 3,
      dispatchReady: 11,
      receiptBacklog: 14,
      pickingAccuracyPct: 96.8,
    });
  }
}
