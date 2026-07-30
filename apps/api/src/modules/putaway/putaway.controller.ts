import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { movementPriorities, putawayTaskStatuses } from '@nova/shared-types';

@ApiTags('Putaway')
@Controller({
  path: 'putaway-tasks',
  version: '1',
})
export class PutawayController {
  @Get()
  listFoundation() {
    return {
      items: [],
      priorities: movementPriorities,
      statuses: putawayTaskStatuses,
    };
  }
}
