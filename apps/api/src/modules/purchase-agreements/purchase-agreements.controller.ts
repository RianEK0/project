import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { blanketOrderStatuses, purchaseContractStatuses } from '@nova/shared-types';

@ApiTags('Purchase Agreements')
@Controller({
  path: 'purchase-agreements',
  version: '1',
})
export class PurchaseAgreementsController {
  @Get()
  listFoundation() {
    return {
      blanketOrders: [],
      contracts: [],
      blanketOrderStatuses,
      purchaseContractStatuses,
    };
  }
}
