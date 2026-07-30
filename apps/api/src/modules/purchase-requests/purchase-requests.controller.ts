import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { procurementRequestSourceTypes, purchaseRequestStatuses } from '@nova/shared-types';

import { PurchaseRequestWorkflowService } from './purchase-request-workflow.service';

@ApiTags('Purchase Requests')
@Controller({
  path: 'purchase-requests',
  version: '1',
})
export class PurchaseRequestsController {
  constructor(private readonly purchaseRequestWorkflowService: PurchaseRequestWorkflowService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      sourceTypes: procurementRequestSourceTypes,
      statuses: purchaseRequestStatuses,
    };
  }

  @Get('metadata')
  getMetadata() {
    return {
      transitions: this.purchaseRequestWorkflowService.getTransitionMatrix(),
      sourceTypes: procurementRequestSourceTypes,
    };
  }
}
