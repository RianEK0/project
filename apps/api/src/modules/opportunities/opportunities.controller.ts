import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { opportunityStages, salesPipelineStages } from '@nova/shared-types';

@ApiTags('Opportunities')
@Controller({
  path: 'opportunities',
  version: '1',
})
export class OpportunitiesController {
  @Get()
  listFoundation() {
    return {
      items: [],
      stages: opportunityStages,
      pipelineStages: salesPipelineStages,
    };
  }

  @Get('metadata')
  getMetadata() {
    return {
      stages: opportunityStages,
      closingStages: ['WON', 'LOST'],
      pipelineStages: salesPipelineStages,
    };
  }
}
