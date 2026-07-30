import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  followUpStatuses,
  reminderStatuses,
  salesActivityStatuses,
  salesActivityTypes,
  salesTaskPriorities,
} from '@nova/shared-types';

@ApiTags('Sales Activities')
@Controller({
  path: 'sales-activities',
  version: '1',
})
export class SalesActivitiesController {
  @Get()
  listFoundation() {
    return {
      items: [],
      activityTypes: salesActivityTypes,
      statuses: salesActivityStatuses,
      priorities: salesTaskPriorities,
      reminderStatuses,
      followUpStatuses,
    };
  }
}
