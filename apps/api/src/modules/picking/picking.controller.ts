import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  movementPriorities,
  pickingTaskStatuses,
  pickingWaveStatuses,
  pickingWaveStrategies,
} from '@nova/shared-types';

@ApiTags('Picking')
@Controller({
  path: 'picking',
  version: '1',
})
export class PickingController {
  @Get()
  listFoundation() {
    return {
      waves: [],
      tasks: [],
      priorities: movementPriorities,
      waveStatuses: pickingWaveStatuses,
      waveStrategies: pickingWaveStrategies,
      taskStatuses: pickingTaskStatuses,
    };
  }
}
