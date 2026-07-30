import { Module } from '@nestjs/common';

import { SalesDashboardController } from './sales-dashboard.controller';

@Module({
  controllers: [SalesDashboardController],
})
export class SalesDashboardModule {}
