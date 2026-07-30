import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { aiInsightTypes, aiModelModes, aiRequestStatuses } from '@nova/shared-types';

@ApiTags('Ask CRM')
@Controller({
  path: 'ask-crm',
  version: '1',
})
export class AskCrmController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: aiRequestStatuses,
      primaryDomain: 'CRM',
      insightTypes: aiInsightTypes.filter((type) =>
        ['ANSWER', 'SEARCH', 'REPORT', 'RECOMMENDATION'].includes(type),
      ),
      modelModes: aiModelModes,
      supportedQuestions: [
        'Which opportunities have stalled in pipeline?',
        'What follow-ups are overdue by account owner?',
        'Which deals need the next best action recommendation?',
      ],
      suggestedPrompts: [
        'List overdue follow-ups by sales rep.',
        'Summarize pipeline risk for this week.',
        'Recommend next action for stalled opportunities.',
      ],
    };
  }
}
