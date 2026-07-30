import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { rfqStatuses } from '@nova/shared-types';

@ApiTags('Request For Quotations')
@Controller({
  path: 'request-for-quotations',
  version: '1',
})
export class RequestForQuotationsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: rfqStatuses,
      sourcingStage: 'purchase-request-approved',
    };
  }
}
