import { Module } from '@nestjs/common';

import { InventoryStatusTransfersController } from './inventory-status-transfers.controller';

@Module({
  controllers: [InventoryStatusTransfersController],
})
export class InventoryStatusTransfersModule {}
