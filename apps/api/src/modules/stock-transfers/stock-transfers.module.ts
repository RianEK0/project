import { Module } from '@nestjs/common';

import { StockTransfersController } from './stock-transfers.controller';

@Module({
  controllers: [StockTransfersController],
})
export class StockTransfersModule {}
