import { Module } from '@nestjs/common';

import { FinanceDashboardController } from './finance-dashboard.controller';
import { FinanceDashboardScorecardService } from './finance-dashboard-scorecard.service';

@Module({
  controllers: [FinanceDashboardController],
  providers: [FinanceDashboardScorecardService],
})
export class FinanceDashboardModule {}
