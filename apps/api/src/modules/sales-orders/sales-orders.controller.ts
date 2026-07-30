import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { salesOrderSourceTypes, salesOrderStatuses } from '@nova/shared-types';

import { SalesOrderWorkflowService } from './sales-order-workflow.service';

@ApiTags('Sales Orders')
@Controller({
  path: 'sales-orders',
  version: '1',
})
export class SalesOrdersController {
  constructor(private readonly salesOrderWorkflowService: SalesOrderWorkflowService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      sourceTypes: salesOrderSourceTypes,
      statuses: salesOrderStatuses,
    };
  }

  @Get('metadata')
  getMetadata() {
    return {
      transitions: this.salesOrderWorkflowService.getTransitionMatrix(),
      sourceTypes: salesOrderSourceTypes,
      invoiceReadyStatuses: this.salesOrderWorkflowService.getInvoiceReadyStatuses(),
    };
  }
}
