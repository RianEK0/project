import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { salesOrderSourceTypes, salesOrderStatuses } from '@nova/shared-types';

@ApiTags('Portal Orders')
@Controller({
  path: 'portal-orders',
  version: '1',
})
export class PortalOrdersController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: salesOrderStatuses,
      sourceTypes: salesOrderSourceTypes,
      customerFacingStatuses: salesOrderStatuses.filter((status) => status !== 'REJECTED'),
    };
  }
}
