import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { kpiStatuses } from '@nova/shared-types';

@ApiTags('Kpis')
@Controller({
  path: 'kpis',
  version: '1',
})
export class KpisController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: kpiStatuses,
      cadences: ['Monthly', 'Quarterly', 'Annual'],
      scoreBands: ['At Risk', 'On Track', 'Stretch'],
    };
  }
}
