import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { shiftStatuses } from '@nova/shared-types';

@ApiTags('Shifts')
@Controller({
  path: 'shifts',
  version: '1',
})
export class ShiftsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: shiftStatuses,
      templates: ['Morning', 'Evening', 'Night', 'Flexible'],
      publishingRules: ['Weekly roster publish', 'Cross-shift overlap check', 'Attendance linkage'],
    };
  }
}
