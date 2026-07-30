import { Module } from '@nestjs/common';

import { PortalOrdersController } from './portal-orders.controller';

@Module({
  controllers: [PortalOrdersController],
})
export class PortalOrdersModule {}
