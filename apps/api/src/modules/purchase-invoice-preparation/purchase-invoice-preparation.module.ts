import { Module } from '@nestjs/common';

import { PurchaseInvoicePreparationController } from './purchase-invoice-preparation.controller';

@Module({
  controllers: [PurchaseInvoicePreparationController],
})
export class PurchaseInvoicePreparationModule {}
