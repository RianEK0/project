import { Module } from '@nestjs/common';

import { PurchaseAgreementsController } from './purchase-agreements.controller';

@Module({
  controllers: [PurchaseAgreementsController],
})
export class PurchaseAgreementsModule {}
