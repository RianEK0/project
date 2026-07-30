import { Module } from '@nestjs/common';

import { PurchaseAnalyticsController } from './purchase-analytics.controller';

@Module({
  controllers: [PurchaseAnalyticsController],
})
export class PurchaseAnalyticsModule {}
