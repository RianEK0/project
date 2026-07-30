import { Module } from '@nestjs/common';

import { SalesFunnelController } from './sales-funnel.controller';

@Module({
  controllers: [SalesFunnelController],
})
export class SalesFunnelModule {}
