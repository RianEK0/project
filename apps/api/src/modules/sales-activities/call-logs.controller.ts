import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { callLogOutcomes, salesActivityStatuses } from '@nova/shared-types';

@ApiTags('Call Logs')
@Controller({
  path: 'call-logs',
  version: '1',
})
export class CallLogsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      outcomes: callLogOutcomes,
      statuses: salesActivityStatuses,
    };
  }
}
