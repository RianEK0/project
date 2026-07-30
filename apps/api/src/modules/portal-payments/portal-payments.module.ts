import { Module } from '@nestjs/common';

import { PortalPaymentsController } from './portal-payments.controller';

@Module({
  controllers: [PortalPaymentsController],
})
export class PortalPaymentsModule {}
