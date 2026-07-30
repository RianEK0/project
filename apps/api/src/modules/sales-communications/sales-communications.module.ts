import { Module } from '@nestjs/common';

import { SalesEmailController } from './sales-email.controller';
import { SalesWhatsappController } from './sales-whatsapp.controller';

@Module({
  controllers: [SalesEmailController, SalesWhatsappController],
})
export class SalesCommunicationsModule {}
