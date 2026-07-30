import { Module } from '@nestjs/common';

import { PurchaseReceiptsController } from './purchase-receipts.controller';

@Module({
  controllers: [PurchaseReceiptsController],
})
export class PurchaseReceiptsModule {}
