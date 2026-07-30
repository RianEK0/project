import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { invoiceStatuses, purchaseInvoicePreparationStatuses } from '@nova/shared-types';

@ApiTags('Purchase Invoice Preparation')
@Controller({
  path: 'purchase-invoice-preparation',
  version: '1',
})
export class PurchaseInvoicePreparationController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: purchaseInvoicePreparationStatuses,
      downstreamInvoiceStatuses: invoiceStatuses,
    };
  }
}
