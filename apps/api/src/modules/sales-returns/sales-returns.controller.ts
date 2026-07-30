import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { salesReturnStatuses } from '@nova/shared-types';

import { SalesReturnWorkflowService } from './sales-return-workflow.service';

@ApiTags('Sales Returns')
@Controller({
  path: 'sales-returns',
  version: '1',
})
export class SalesReturnsController {
  constructor(private readonly salesReturnWorkflowService: SalesReturnWorkflowService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: salesReturnStatuses,
    };
  }

  @Get('metadata')
  getMetadata() {
    return {
      transitions: this.salesReturnWorkflowService.getTransitionMatrix(),
      creditNoteEligibleStatuses: this.salesReturnWorkflowService.getCreditNoteEligibleStatuses(),
    };
  }
}
