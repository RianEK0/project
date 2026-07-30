import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { dashboardSignalTones } from '@nova/shared-types';

import { CeoDashboardBriefingService } from './ceo-dashboard-briefing.service';

@ApiTags('CEO Dashboard')
@Controller({
  path: 'ceo-dashboard',
  version: '1',
})
export class CeoDashboardController {
  constructor(private readonly ceoDashboardBriefingService: CeoDashboardBriefingService) {}

  @Get()
  getDashboard() {
    return {
      audience: 'CEO',
      supportedWindows: ['THIS_MONTH', 'THIS_QUARTER', 'YTD'],
      signals: dashboardSignalTones,
      agenda: [
        'Revenue run-rate',
        'Pipeline coverage',
        'Liquidity resilience',
        'Strategic initiative delivery',
        'Executive escalations',
      ],
      relatedDashboards: [
        { label: 'Executive Dashboard', route: '/app/dashboards/executive' },
        { label: 'Finance Dashboard', route: '/app/dashboards/finance' },
        { label: 'Sales Dashboard', route: '/app/dashboards/sales' },
      ],
    };
  }

  @Get('briefing-preview')
  getBriefingPreview() {
    return this.ceoDashboardBriefingService.previewBriefing({
      netRevenueRunRate: 1_420_000,
      pipelineCoverageRatio: 2.1,
      liquidityRatio: 1.35,
      strategicInitiativesOnTrackPct: 76,
      blockedEscalations: 3,
    });
  }
}
