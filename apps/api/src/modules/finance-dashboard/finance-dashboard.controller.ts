import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { dashboardSignalTones } from '@nova/shared-types';

import { FinanceDashboardScorecardService } from './finance-dashboard-scorecard.service';

@ApiTags('Finance Dashboard')
@Controller({
  path: 'finance-dashboard',
  version: '1',
})
export class FinanceDashboardController {
  constructor(
    private readonly financeDashboardScorecardService: FinanceDashboardScorecardService,
  ) {}

  @Get()
  getDashboard() {
    return {
      audience: 'FINANCE',
      supportedWindows: ['TODAY', 'THIS_MONTH', 'THIS_QUARTER', 'YTD'],
      signals: dashboardSignalTones,
      scorecards: [
        { id: 'runway', label: 'Cash Runway', route: '/app/finance/cash-flow' },
        { id: 'liquidity', label: 'Current Ratio', route: '/app/finance/balance-sheet' },
        { id: 'receivables', label: 'Receivables Pressure', route: '/app/sales/invoices' },
        { id: 'budget', label: 'Budget Variance', route: '/app/finance/budgets' },
      ],
      relatedDashboards: [
        { label: 'Executive Dashboard', route: '/app/dashboards/executive' },
        { label: 'CEO Dashboard', route: '/app/dashboards/ceo' },
      ],
    };
  }

  @Get('scorecard-preview')
  getScorecardPreview() {
    return this.financeDashboardScorecardService.previewScorecard({
      cashOnHand: 1_850_000,
      monthlyBurn: 240_000,
      overdueReceivable: 480_000,
      budgetVariancePct: 9.5,
      currentRatio: 1.28,
    });
  }
}
