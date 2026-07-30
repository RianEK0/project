import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { paymentMethods, paymentStatuses } from '@nova/shared-types';

@ApiTags('Portal Payments')
@Controller({
  path: 'portal-payments',
  version: '1',
})
export class PortalPaymentsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: paymentStatuses,
      methods: paymentMethods,
      availableActions: ['SUBMIT_PAYMENT_PROOF', 'VIEW_RECEIPT'],
    };
  }
}
