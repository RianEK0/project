import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { invoiceStatuses, paymentStatuses, salesInvoiceStatuses } from '@nova/shared-types';

@ApiTags('Sales Invoices')
@Controller({
  path: 'sales-invoices',
  version: '1',
})
export class SalesInvoicesController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: salesInvoiceStatuses,
      invoiceStatuses,
      paymentStatuses,
    };
  }
}
