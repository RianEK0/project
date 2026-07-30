import { Module } from '@nestjs/common';

import { PurchaseOrderWorkflowService } from './purchase-order-workflow.service';
import { PurchaseOrdersController } from './purchase-orders.controller';

@Module({
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrderWorkflowService],
  exports: [PurchaseOrderWorkflowService],
})
export class PurchaseOrdersModule {}
