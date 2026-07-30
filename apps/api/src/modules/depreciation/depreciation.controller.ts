import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { depreciationMethods, depreciationRunStatuses } from '@nova/shared-types';

import { DepreciationScheduleService } from './depreciation-schedule.service';

@ApiTags('Depreciation')
@Controller({
  path: 'depreciation',
  version: '1',
})
export class DepreciationController {
  constructor(private readonly depreciationScheduleService: DepreciationScheduleService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: depreciationRunStatuses,
      methods: depreciationMethods,
      supportedPreviewMethods: this.depreciationScheduleService.getSupportedPreviewMethods(),
    };
  }

  @Get('preview')
  getPreview() {
    return this.depreciationScheduleService.previewSchedule({
      acquisitionCost: 24000000,
      residualValue: 0,
      usefulLifeMonths: 48,
      inServiceDate: '2026-07-01T00:00:00.000Z',
      method: 'STRAIGHT_LINE',
    });
  }
}
