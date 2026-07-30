import { Module } from '@nestjs/common';

import { SalesReturnsController } from './sales-returns.controller';
import { SalesReturnWorkflowService } from './sales-return-workflow.service';

@Module({
  controllers: [SalesReturnsController],
  providers: [SalesReturnWorkflowService],
})
export class SalesReturnsModule {}
