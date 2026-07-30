import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { NaturalLanguageQueryPlannerService } from './natural-language-query-planner.service';

@ApiTags('Natural Language Search')
@Controller({
  path: 'natural-language-search',
  version: '1',
})
export class NaturalLanguageSearchController {
  constructor(
    private readonly naturalLanguageQueryPlannerService: NaturalLanguageQueryPlannerService,
  ) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: this.naturalLanguageQueryPlannerService.getStatuses(),
      domains: this.naturalLanguageQueryPlannerService.getDomains(),
      modelModes: this.naturalLanguageQueryPlannerService.getModelModes(),
      sampleEntities: ['Document number', 'Customer', 'Vendor', 'Warehouse', 'Employee'],
    };
  }

  @Get('plan-preview')
  getPlanPreview() {
    return this.naturalLanguageQueryPlannerService.planQuery(
      'Find overdue follow up opportunities for this week',
    );
  }
}
