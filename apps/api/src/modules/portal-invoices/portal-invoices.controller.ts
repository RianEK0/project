import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { downloadAssetTypes, invoiceStatuses } from '@nova/shared-types';

@ApiTags('Portal Invoices')
@Controller({
  path: 'portal-invoices',
  version: '1',
})
export class PortalInvoicesController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: invoiceStatuses,
      downloadableAssets: downloadAssetTypes.filter((type) =>
        ['INVOICE_PDF', 'PAYMENT_RECEIPT', 'STATEMENT'].includes(type),
      ),
    };
  }
}
