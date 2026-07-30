import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { aiInsightTypes, aiModelModes, aiRequestStatuses } from '@nova/shared-types';

@ApiTags('AI Procurement')
@Controller({
  path: 'ai-procurement',
  version: '1',
})
export class AiProcurementController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: aiRequestStatuses,
      primaryDomain: 'PROCUREMENT',
      insightTypes: aiInsightTypes.filter((type) =>
        ['SUMMARY', 'REPORT', 'RECOMMENDATION', 'FORECAST'].includes(type),
      ),
      modelModes: aiModelModes,
      scenarios: ['RFQ prioritization', 'Vendor comparison recap', 'Backorder mitigation'],
      suggestedPrompts: [
        'Summarize vendor lead-time risk.',
        'Recommend which RFQ should be awarded first.',
        'Forecast purchase exposure for the next 30 days.',
      ],
    };
  }
}
