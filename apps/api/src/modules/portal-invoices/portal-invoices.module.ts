import { Module } from '@nestjs/common';

import { PortalInvoicesController } from './portal-invoices.controller';

@Module({
  controllers: [PortalInvoicesController],
})
export class PortalInvoicesModule {}
