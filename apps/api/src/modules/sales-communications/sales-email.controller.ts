import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { salesCommunicationStatuses } from '@nova/shared-types';

@ApiTags('Sales Email')
@Controller({
  path: 'sales-email',
  version: '1',
})
export class SalesEmailController {
  @Get()
  listFoundation() {
    return {
      items: [],
      channel: 'EMAIL',
      statuses: salesCommunicationStatuses,
    };
  }
}
