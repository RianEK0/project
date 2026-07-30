import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { creditNoteStatuses } from '@nova/shared-types';

import { SalesReturnWorkflowService } from '../sales-returns/sales-return-workflow.service';

@ApiTags('Credit Notes')
@Controller({
  path: 'credit-notes',
  version: '1',
})
export class CreditNotesController {
  constructor(private readonly salesReturnWorkflowService: SalesReturnWorkflowService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: creditNoteStatuses,
    };
  }

  @Get('metadata')
  getMetadata() {
    return {
      statuses: creditNoteStatuses,
      eligibleReturnStatuses: this.salesReturnWorkflowService.getCreditNoteEligibleStatuses(),
    };
  }
}
