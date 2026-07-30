import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { maintenanceStatuses, maintenanceTypes } from '@nova/shared-types';

@ApiTags('Maintenance')
@Controller({
  path: 'maintenance',
  version: '1',
})
export class MaintenanceController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: maintenanceStatuses,
      maintenanceTypes,
      triggers: ['Preventive Schedule', 'Breakdown Alert', 'Calibration Due', 'Condition Based'],
    };
  }
}
