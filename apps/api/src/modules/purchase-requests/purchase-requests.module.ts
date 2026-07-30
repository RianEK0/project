import { Module } from '@nestjs/common';

import { PurchaseRequestWorkflowService } from './purchase-request-workflow.service';
import { PurchaseRequestsController } from './purchase-requests.controller';

@Module({
  controllers: [PurchaseRequestsController],
  providers: [PurchaseRequestWorkflowService],
  exports: [PurchaseRequestWorkflowService],
})
export class PurchaseRequestsModule {}
