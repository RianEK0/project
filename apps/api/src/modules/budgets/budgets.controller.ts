import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { budgetPlanStatuses } from '@nova/shared-types';

@ApiTags('Budgets')
@Controller({
  path: 'budgets',
  version: '1',
})
export class BudgetsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: budgetPlanStatuses,
      dimensions: ['ACCOUNT', 'COST_CENTER', 'PERIOD', 'PROJECT'],
      controls: ['APPROVAL', 'LOCKING', 'VARIANCE_REVIEW'],
    };
  }
}
