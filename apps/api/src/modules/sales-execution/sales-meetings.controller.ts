import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { meetingStatuses } from '@nova/shared-types';

@ApiTags('Sales Meetings')
@Controller({
  path: 'sales-meetings',
  version: '1',
})
export class SalesMeetingsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: meetingStatuses,
    };
  }
}
