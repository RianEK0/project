import { Module } from '@nestjs/common';

import { StockAdjustmentsController } from './stock-adjustments.controller';

@Module({
  controllers: [StockAdjustmentsController],
})
export class StockAdjustmentsModule {}
