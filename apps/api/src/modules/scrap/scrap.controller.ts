import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { scrapReasonTypes } from '@nova/shared-types';

@ApiTags('Scrap')
@Controller({
  path: 'scrap',
  version: '1',
})
export class ScrapController {
  @Get()
  listFoundation() {
    return {
      items: [],
      reasonTypes: scrapReasonTypes,
      controls: ['Supervisor Approval', 'Variance Review', 'Root Cause Tagging'],
      linkedViews: ['Quality Control', 'Production', 'Costing'],
    };
  }
}
