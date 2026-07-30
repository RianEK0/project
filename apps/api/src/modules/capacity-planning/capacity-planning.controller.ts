import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CapacityLoadService } from './capacity-load.service';

@ApiTags('Capacity Planning')
@Controller({
  path: 'capacity-planning',
  version: '1',
})
export class CapacityPlanningController {
  constructor(private readonly capacityLoadService: CapacityLoadService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: this.capacityLoadService.getStatuses(),
      bucketTypes: ['Shift', 'Day', 'Week'],
      balancingLevers: this.capacityLoadService.getBalancingLevers(),
    };
  }

  @Get('load-preview')
  getLoadPreview() {
    return this.capacityLoadService.previewLoad({
      workCenter: 'WC-ASSEMBLY-01',
      availableHours: 80,
      plannedHours: 72,
      overtimeBufferHours: 8,
    });
  }
}
