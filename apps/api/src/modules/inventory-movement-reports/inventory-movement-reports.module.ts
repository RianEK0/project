import { Module } from '@nestjs/common';

import { InventoryMovementReportsController } from './inventory-movement-reports.controller';

@Module({
  controllers: [InventoryMovementReportsController],
})
export class InventoryMovementReportsModule {}
