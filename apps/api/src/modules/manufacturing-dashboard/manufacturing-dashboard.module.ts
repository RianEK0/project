import { Module } from '@nestjs/common';

import { ManufacturingDashboardController } from './manufacturing-dashboard.controller';
import { ManufacturingDashboardThroughputService } from './manufacturing-dashboard-throughput.service';

@Module({
  controllers: [ManufacturingDashboardController],
  providers: [ManufacturingDashboardThroughputService],
})
export class ManufacturingDashboardModule {}
