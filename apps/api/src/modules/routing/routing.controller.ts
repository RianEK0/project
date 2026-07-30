import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { routingOperationTypes, routingStatuses } from '@nova/shared-types';

@ApiTags('Routing')
@Controller({
  path: 'routing',
  version: '1',
})
export class RoutingController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: routingStatuses,
      operationTypes: routingOperationTypes,
      timeBases: ['Setup', 'Run', 'Queue', 'Move'],
    };
  }
}
