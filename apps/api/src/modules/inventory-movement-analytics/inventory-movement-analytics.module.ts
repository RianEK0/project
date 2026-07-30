import { Module } from '@nestjs/common';

import { InventoryMovementAnalyticsController } from './inventory-movement-analytics.controller';

@Module({
  controllers: [InventoryMovementAnalyticsController],
})
export class InventoryMovementAnalyticsModule {}
