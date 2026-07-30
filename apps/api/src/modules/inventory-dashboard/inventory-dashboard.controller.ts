import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { dashboardSignalTones } from '@nova/shared-types';

import { InventoryDashboardHealthService } from './inventory-dashboard-health.service';

@ApiTags('Inventory Dashboard')
@Controller({
  path: 'inventory-dashboard',
  version: '1',
})
export class InventoryDashboardController {
  constructor(private readonly inventoryDashboardHealthService: InventoryDashboardHealthService) {}

  @Get()
  getDashboard() {
    return {
      audience: 'INVENTORY',
      supportedWindows: ['TODAY', 'THIS_WEEK', 'THIS_MONTH'],
      signals: dashboardSignalTones,
      scorecards: [
        { id: 'on-hand', label: 'Inventory Value', route: '/app/inventory' },
        { id: 'blocked', label: 'Blocked Stock', route: '/app/warehouse-operations/adjustments' },
        { id: 'aging', label: 'Aging Exposure', route: '/app/inventory' },
        {
          id: 'accuracy',
          label: 'Stock Accuracy',
          route: '/app/warehouse-operations/stock-counts',
        },
      ],
      relatedDashboards: [
        { label: 'Warehouse Dashboard', route: '/app/dashboards/warehouse' },
        { label: 'Procurement Dashboard', route: '/app/procurement/analytics' },
      ],
    };
  }

  @Get('health-preview')
  getHealthPreview() {
    return this.inventoryDashboardHealthService.previewHealth({
      onHandValue: 2_900_000,
      blockedValue: 210_000,
      agingStockValue: 260_000,
      reorderAlerts: 11,
      stockAccuracyPct: 96.4,
    });
  }
}
