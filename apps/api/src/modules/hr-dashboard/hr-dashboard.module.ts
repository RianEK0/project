import { Module } from '@nestjs/common';

import { HrDashboardController } from './hr-dashboard.controller';
import { HrDashboardPeopleOpsService } from './hr-dashboard-people-ops.service';

@Module({
  controllers: [HrDashboardController],
  providers: [HrDashboardPeopleOpsService],
})
export class HrDashboardModule {}
