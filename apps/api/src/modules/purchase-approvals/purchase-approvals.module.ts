import { Module } from '@nestjs/common';

import { PurchaseApprovalsController } from './purchase-approvals.controller';

@Module({
  controllers: [PurchaseApprovalsController],
})
export class PurchaseApprovalsModule {}
