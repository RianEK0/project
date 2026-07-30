import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { productionPlanningStatuses } from '@nova/shared-types';

@ApiTags('Production Planning')
@Controller({
  path: 'production-planning',
  version: '1',
})
export class ProductionPlanningController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: productionPlanningStatuses,
      planningHorizons: ['Daily', 'Weekly', 'Monthly', 'Frozen Window'],
      releaseRules: ['Material Feasible', 'Capacity Feasible', 'Quality Gate Ready'],
    };
  }
}
