import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { dealStages } from '@nova/shared-types';

@ApiTags('Deals')
@Controller({
  path: 'deals',
  version: '1',
})
export class DealsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      stages: dealStages,
    };
  }

  @Get('metadata')
  getMetadata() {
    return {
      stages: dealStages,
      closingStages: ['WON', 'LOST', 'CANCELLED'],
    };
  }
}
