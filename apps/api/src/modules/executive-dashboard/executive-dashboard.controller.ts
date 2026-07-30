import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { dashboardSignalTones, dashboardTimeWindows } from '@nova/shared-types';

import { ExecutiveDashboardComposerService } from './executive-dashboard-composer.service';

@ApiTags('Executive Dashboard')
@Controller({
  path: 'executive-dashboard',
  version: '1',
})
export class ExecutiveDashboardController {
  constructor(
    private readonly executiveDashboardComposerService: ExecutiveDashboardComposerService,
  ) {}

  @Get()
  getDashboard() {
    return {
      audience: 'EXECUTIVE',
      supportedWindows: dashboardTimeWindows,
      signals: dashboardSignalTones,
      scorecards: [
        { id: 'growth', label: 'Growth And Runway', route: '/app/dashboards/executive' },
        { id: 'fulfillment', label: 'Commercial Fulfillment', route: '/app/dashboards/sales' },
        { id: 'inventory', label: 'Inventory Exposure', route: '/app/dashboards/inventory' },
        { id: 'people-capacity', label: 'People And Capacity', route: '/app/dashboards/hr' },
      ],
      relatedDashboards: [
        { label: 'CEO Dashboard', route: '/app/dashboards/ceo' },
        { label: 'Finance Dashboard', route: '/app/dashboards/finance' },
        { label: 'Manufacturing Dashboard', route: '/app/dashboards/manufacturing' },
      ],
    };
  }

  @Get('preview')
  getPreview() {
    return this.executiveDashboardComposerService.previewPortfolio({
      revenueGrowthPct: 11.4,
      cashRunwayMonths: 7.2,
      orderFillRatePct: 93.8,
      inventoryAtRiskPct: 7.1,
      attendancePct: 96.2,
      capacityUtilizationPct: 88.5,
    });
  }
}
