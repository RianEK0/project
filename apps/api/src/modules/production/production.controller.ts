import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { productionStatuses } from '@nova/shared-types';

@ApiTags('Production')
@Controller({
  path: 'production',
  version: '1',
})
export class ProductionController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: productionStatuses,
      orderTypes: ['Make To Stock', 'Make To Order', 'Pilot', 'Rework'],
      downstreamDocuments: ['Work Order', 'Quality Control', 'Scrap Report'],
    };
  }
}
