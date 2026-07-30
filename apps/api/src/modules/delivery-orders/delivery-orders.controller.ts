import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { deliveryOrderStatuses } from '@nova/shared-types';

import { DeliveryOrderWorkflowService } from './delivery-order-workflow.service';

@ApiTags('Delivery Orders')
@Controller({
  path: 'delivery-orders',
  version: '1',
})
export class DeliveryOrdersController {
  constructor(private readonly deliveryOrderWorkflowService: DeliveryOrderWorkflowService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: deliveryOrderStatuses,
    };
  }

  @Get('metadata')
  getMetadata() {
    return {
      transitions: this.deliveryOrderWorkflowService.getTransitionMatrix(),
      dispatchReadyStatuses: ['PACKED'],
    };
  }
}
