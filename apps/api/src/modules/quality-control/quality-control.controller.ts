import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { qualityControlStatuses, qualityDecisionTypes } from '@nova/shared-types';

@ApiTags('Quality Control')
@Controller({
  path: 'quality-control',
  version: '1',
})
export class QualityControlController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: qualityControlStatuses,
      decisionTypes: qualityDecisionTypes,
      inspectionPoints: ['Incoming', 'In Process', 'Final', 'Rework Verification'],
    };
  }
}
