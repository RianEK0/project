import { Module } from '@nestjs/common';

import { DeliveryOrdersController } from './delivery-orders.controller';
import { DeliveryOrderWorkflowService } from './delivery-order-workflow.service';

@Module({
  controllers: [DeliveryOrdersController],
  providers: [DeliveryOrderWorkflowService],
})
export class DeliveryOrdersModule {}
