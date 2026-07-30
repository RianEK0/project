import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { salesQuotationStatuses } from '@nova/shared-types';

import { SalesQuotationWorkflowService } from './sales-quotation-workflow.service';

@ApiTags('Sales Quotations')
@Controller({
  path: 'sales-quotations',
  version: '1',
})
export class SalesQuotationsController {
  constructor(private readonly salesQuotationWorkflowService: SalesQuotationWorkflowService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: salesQuotationStatuses,
    };
  }

  @Get('metadata')
  getMetadata() {
    return {
      transitions: this.salesQuotationWorkflowService.getTransitionMatrix(),
      convertibleStatuses: ['ACCEPTED'],
    };
  }
}
