import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { dashboardSignalTones } from '@nova/shared-types';

import { ManufacturingDashboardThroughputService } from './manufacturing-dashboard-throughput.service';

@ApiTags('Manufacturing Dashboard')
@Controller({
  path: 'manufacturing-dashboard',
  version: '1',
})
export class ManufacturingDashboardController {
  constructor(
    private readonly manufacturingDashboardThroughputService: ManufacturingDashboardThroughputService,
  ) {}

  @Get()
  getDashboard() {
    return {
      audience: 'MANUFACTURING',
      supportedWindows: ['THIS_WEEK', 'THIS_MONTH'],
      signals: dashboardSignalTones,
      scorecards: [
        { id: 'production', label: 'Production Load', route: '/app/manufacturing/production' },
        {
          id: 'capacity',
          label: 'Capacity Planning',
          route: '/app/manufacturing/capacity-planning',
        },
        { id: 'quality', label: 'Quality Control', route: '/app/manufacturing/quality-control' },
        { id: 'mrp', label: 'MRP Shortages', route: '/app/manufacturing/mrp' },
      ],
      relatedDashboards: [
        { label: 'Executive Dashboard', route: '/app/dashboards/executive' },
        { label: 'Inventory Dashboard', route: '/app/dashboards/inventory' },
      ],
    };
  }

  @Get('throughput-preview')
  getThroughputPreview() {
    return this.manufacturingDashboardThroughputService.previewThroughput({
      workCenter: 'WC-PAINT-01',
      availableHours: 76,
      plannedHours: 74,
      overtimeBufferHours: 6,
      firstPassYieldPct: 95.4,
      shortageOrders: 7,
    });
  }
}
