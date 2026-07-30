import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { machineStatuses, machineTypes } from '@nova/shared-types';

@ApiTags('Machines')
@Controller({
  path: 'machines',
  version: '1',
})
export class MachinesController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: machineStatuses,
      machineTypes,
      availabilitySignals: ['Capacity Hours', 'Setup Window', 'Maintenance Window', 'Calibration'],
    };
  }
}
