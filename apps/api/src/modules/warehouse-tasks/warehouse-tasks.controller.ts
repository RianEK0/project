import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { movementPriorities, warehouseTaskStatuses, warehouseTaskTypes } from '@nova/shared-types';

@ApiTags('Warehouse Tasks')
@Controller({
  path: 'warehouse-tasks',
  version: '1',
})
export class WarehouseTasksController {
  @Get()
  listFoundation() {
    return {
      items: [],
      priorities: movementPriorities,
      taskTypes: warehouseTaskTypes,
      statuses: warehouseTaskStatuses,
    };
  }

  @Get('workload')
  getWorkload() {
    return {
      buckets: warehouseTaskStatuses.map((status) => ({
        status,
        count: 0,
      })),
      priorities: movementPriorities,
    };
  }

  @Get('my-tasks')
  getMyTasks() {
    return {
      items: [],
      statuses: warehouseTaskStatuses,
    };
  }
}
