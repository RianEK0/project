import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { aiModelModes, aiReportTypes, aiRequestStatuses } from '@nova/shared-types';

@ApiTags('AI Reports')
@Controller({
  path: 'ai-reports',
  version: '1',
})
export class AiReportsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: aiRequestStatuses,
      reportTypes: aiReportTypes,
      modelModes: aiModelModes,
      deliveryModes: ['On demand', 'Scheduled digest', 'Exception burst'],
      aggregationWindows: ['Daily', 'Weekly', 'Monthly', 'Quarterly'],
    };
  }
}
