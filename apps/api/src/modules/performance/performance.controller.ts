import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { performanceReviewStatuses } from '@nova/shared-types';

@ApiTags('Performance')
@Controller({
  path: 'performance',
  version: '1',
})
export class PerformanceController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: performanceReviewStatuses,
      cycleTypes: ['Quarterly', 'Semi-Annual', 'Annual'],
      calibrationViews: ['Goal Review', 'Competency Matrix', 'Manager Calibration'],
    };
  }
}
