import { Module } from '@nestjs/common';

import { WarehouseDashboardController } from './warehouse-dashboard.controller';
import { WarehouseDashboardControlTowerService } from './warehouse-dashboard-control-tower.service';

@Module({
  controllers: [WarehouseDashboardController],
  providers: [WarehouseDashboardControlTowerService],
})
export class WarehouseDashboardModule {}
