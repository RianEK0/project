import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { followUpStatuses, reminderStatuses, salesTaskPriorities } from '@nova/shared-types';

@ApiTags('Sales Tasks')
@Controller({
  path: 'sales-tasks',
  version: '1',
})
export class SalesTasksController {
  @Get()
  listFoundation() {
    return {
      items: [],
      priorities: salesTaskPriorities,
      reminderStatuses,
      followUpStatuses,
    };
  }
}
