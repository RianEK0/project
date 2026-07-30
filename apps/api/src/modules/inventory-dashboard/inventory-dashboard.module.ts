import { Module } from '@nestjs/common';

import { InventoryDashboardController } from './inventory-dashboard.controller';
import { InventoryDashboardHealthService } from './inventory-dashboard-health.service';

@Module({
  controllers: [InventoryDashboardController],
  providers: [InventoryDashboardHealthService],
})
export class InventoryDashboardModule {}
