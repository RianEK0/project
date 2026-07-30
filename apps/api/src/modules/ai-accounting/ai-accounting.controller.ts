import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { aiInsightTypes, aiModelModes, aiRequestStatuses } from '@nova/shared-types';

@ApiTags('AI Accounting')
@Controller({
  path: 'ai-accounting',
  version: '1',
})
export class AiAccountingController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: aiRequestStatuses,
      primaryDomain: 'ACCOUNTING',
      insightTypes: aiInsightTypes.filter((type) =>
        ['ANSWER', 'REPORT', 'FORECAST', 'RECOMMENDATION', 'ANOMALY'].includes(type),
      ),
      modelModes: aiModelModes,
      scenarios: ['Journal anomaly recap', 'Period close readiness', 'Cash-flow briefing'],
      suggestedPrompts: [
        'Summarize journal exceptions for today.',
        'Forecast cash flow for the next 90 days.',
        'Recommend which accounting blockers need escalation.',
      ],
    };
  }
}
