import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { workOrderStatuses } from '@nova/shared-types';

@ApiTags('Work Orders')
@Controller({
  path: 'work-orders',
  version: '1',
})
export class WorkOrdersController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: workOrderStatuses,
      executionSignals: ['Material Ready', 'Machine Ready', 'Operator Ready', 'QC Hold'],
      schedulingModes: ['Forward', 'Backward', 'Finite Capacity'],
    };
  }
}
