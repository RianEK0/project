import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { aiInsightTypes, aiModelModes, aiRequestStatuses } from '@nova/shared-types';

@ApiTags('AI Sales')
@Controller({
  path: 'ai-sales',
  version: '1',
})
export class AiSalesController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: aiRequestStatuses,
      primaryDomain: 'SALES',
      insightTypes: aiInsightTypes.filter((type) =>
        ['SUMMARY', 'REPORT', 'FORECAST', 'RECOMMENDATION'].includes(type),
      ),
      modelModes: aiModelModes,
      scenarios: ['Discount review', 'Shipment risk recap', 'Collection follow-up focus'],
      suggestedPrompts: [
        'Summarize delayed deliveries by customer.',
        'Forecast invoice collection signal for next month.',
        'Recommend which orders need fulfillment escalation.',
      ],
    };
  }
}
