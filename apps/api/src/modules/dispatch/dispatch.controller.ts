import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { dispatchRecordStatuses } from '@nova/shared-types';

@ApiTags('Dispatch')
@Controller({
  path: 'dispatch-records',
  version: '1',
})
export class DispatchController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: dispatchRecordStatuses,
    };
  }
}
