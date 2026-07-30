import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { aiInsightTypes, aiModelModes, aiRequestStatuses } from '@nova/shared-types';

@ApiTags('Ask Finance')
@Controller({
  path: 'ask-finance',
  version: '1',
})
export class AskFinanceController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: aiRequestStatuses,
      primaryDomain: 'FINANCE',
      insightTypes: aiInsightTypes.filter((type) =>
        ['ANSWER', 'REPORT', 'FORECAST', 'RECOMMENDATION'].includes(type),
      ),
      modelModes: aiModelModes,
      supportedQuestions: [
        'Which treasury or bank balances need attention?',
        'How is budget utilization trending by cost center?',
        'What finance exceptions should be escalated first?',
      ],
      suggestedPrompts: [
        'Summarize cash position by bank account.',
        'Forecast budget burn for the next 30 days.',
        'Recommend which finance exceptions to review today.',
      ],
    };
  }
}
