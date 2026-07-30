import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  purchaseOrderStatuses,
  purchaseRequestStatuses,
  purchaseInvoicePreparationStatuses,
  rfqStatuses,
} from '@nova/shared-types';

@ApiTags('Purchase Analytics')
@Controller({
  path: 'purchase-analytics',
  version: '1',
})
export class PurchaseAnalyticsController {
  @Get('dashboard')
  getDashboard() {
    return {
      cards: [
        {
          id: 'request-funnel',
          label: 'Request Funnel',
          stages: purchaseRequestStatuses.length,
        },
        {
          id: 'sourcing-funnel',
          label: 'RFQ And Quotation Funnel',
          stages: rfqStatuses.length,
        },
        {
          id: 'po-funnel',
          label: 'Purchase Order Funnel',
          stages: purchaseOrderStatuses.length,
        },
        {
          id: 'invoice-prep',
          label: 'Invoice Preparation',
          stages: purchaseInvoicePreparationStatuses.length,
        },
      ],
    };
  }
}
