import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  blanketOrderStatuses,
  purchaseInvoicePreparationStatuses,
  purchaseOrderStatuses,
  purchaseOrderTypes,
} from '@nova/shared-types';

import { PurchaseOrderWorkflowService } from './purchase-order-workflow.service';

@ApiTags('Purchase Orders')
@Controller({
  path: 'purchase-orders',
  version: '1',
})
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrderWorkflowService: PurchaseOrderWorkflowService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      orderTypes: purchaseOrderTypes,
      statuses: purchaseOrderStatuses,
      releaseSources: blanketOrderStatuses,
    };
  }

  @Get('metadata')
  getMetadata() {
    return {
      transitions: this.purchaseOrderWorkflowService.getTransitionMatrix(),
      invoicePreparationStatuses: purchaseInvoicePreparationStatuses,
    };
  }
}
