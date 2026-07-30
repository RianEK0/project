import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { supplierQuotationStatuses } from '@nova/shared-types';

@ApiTags('Supplier Quotations')
@Controller({
  path: 'supplier-quotations',
  version: '1',
})
export class SupplierQuotationsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: supplierQuotationStatuses,
      decisionOutput: 'vendor-comparison',
    };
  }
}
