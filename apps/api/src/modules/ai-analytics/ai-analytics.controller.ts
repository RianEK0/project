import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { aiInsightTypes, aiModelModes, aiRequestStatuses } from '@nova/shared-types';

@ApiTags('AI Analytics')
@Controller({
  path: 'ai-analytics',
  version: '1',
})
export class AiAnalyticsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: aiRequestStatuses,
      primaryDomain: 'ANALYTICS',
      insightTypes: aiInsightTypes.filter((type) =>
        ['SUMMARY', 'REPORT', 'FORECAST', 'RECOMMENDATION', 'ANOMALY'].includes(type),
      ),
      modelModes: aiModelModes,
      scenarios: ['Executive briefing', 'Cross-domain exception digest', 'Trend variance review'],
      exportModes: ['Dashboard tile', 'Email digest', 'Download bundle'],
      suggestedPrompts: [
        'Summarize cross-domain exceptions for today.',
        'Forecast enterprise load for next month.',
        'Recommend which business signals should be escalated.',
      ],
    };
  }
}
