import { Module } from '@nestjs/common';

import { InventoryMovementStatusService } from './inventory-movement-status.service';
import { InventoryMovementsController } from './inventory-movements.controller';

@Module({
  controllers: [InventoryMovementsController],
  providers: [InventoryMovementStatusService],
  exports: [InventoryMovementStatusService],
})
export class InventoryMovementsModule {}
