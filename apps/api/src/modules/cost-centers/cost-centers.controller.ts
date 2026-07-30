import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { costCenterStatuses } from '@nova/shared-types';

@ApiTags('Cost Centers')
@Controller({
  path: 'cost-centers',
  version: '1',
})
export class CostCentersController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: costCenterStatuses,
      hierarchyLevels: ['COMPANY', 'DIVISION', 'DEPARTMENT', 'TEAM'],
    };
  }
}
