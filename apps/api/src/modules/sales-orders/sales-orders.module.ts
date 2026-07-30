import { Module } from '@nestjs/common';

import { SalesOrdersController } from './sales-orders.controller';
import { SalesOrderWorkflowService } from './sales-order-workflow.service';

@Module({
  controllers: [SalesOrdersController],
  providers: [SalesOrderWorkflowService],
})
export class SalesOrdersModule {}
