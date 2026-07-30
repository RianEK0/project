import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { purchaseApprovalStatuses } from '@nova/shared-types';

@ApiTags('Purchase Approvals')
@Controller({
  path: 'purchase-approvals',
  version: '1',
})
export class PurchaseApprovalsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: purchaseApprovalStatuses,
      decisionTargets: ['purchase-request', 'vendor-comparison', 'purchase-order'],
    };
  }
}
