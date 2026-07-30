import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { leadSources, leadStatuses } from '@nova/shared-types';

import { LeadWorkflowService } from './lead-workflow.service';

@ApiTags('Leads')
@Controller({
  path: 'leads',
  version: '1',
})
export class LeadsController {
  constructor(private readonly leadWorkflowService: LeadWorkflowService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      sources: leadSources,
      statuses: leadStatuses,
    };
  }

  @Get('metadata')
  getMetadata() {
    return {
      transitions: this.leadWorkflowService.getTransitionMatrix(),
      sources: leadSources,
      convertibleStatuses: this.leadWorkflowService.getConvertibleStatuses(),
    };
  }
}
