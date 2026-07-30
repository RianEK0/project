import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { aiInsightTypes, aiModelModes, aiRequestStatuses } from '@nova/shared-types';

@ApiTags('AI Manufacturing')
@Controller({
  path: 'ai-manufacturing',
  version: '1',
})
export class AiManufacturingController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: aiRequestStatuses,
      primaryDomain: 'MANUFACTURING',
      insightTypes: aiInsightTypes.filter((type) =>
        ['SUMMARY', 'REPORT', 'FORECAST', 'RECOMMENDATION', 'ANOMALY'].includes(type),
      ),
      modelModes: aiModelModes,
      scenarios: ['MRP exception digest', 'Capacity overload preview', 'Quality loss review'],
      suggestedPrompts: [
        'Summarize MRP shortages by work center.',
        'Forecast overload risk for next planning cycle.',
        'Recommend manufacturing actions for bottleneck orders.',
      ],
    };
  }
}
