import { Module } from '@nestjs/common';

import { SalesQuotationWorkflowService } from './sales-quotation-workflow.service';
import { SalesQuotationsController } from './sales-quotations.controller';

@Module({
  controllers: [SalesQuotationsController],
  providers: [SalesQuotationWorkflowService],
})
export class SalesQuotationsModule {}
