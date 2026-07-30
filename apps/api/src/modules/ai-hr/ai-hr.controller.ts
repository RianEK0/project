import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { aiInsightTypes, aiModelModes, aiRequestStatuses } from '@nova/shared-types';

@ApiTags('AI HR')
@Controller({
  path: 'ai-hr',
  version: '1',
})
export class AiHrController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: aiRequestStatuses,
      primaryDomain: 'HR',
      insightTypes: aiInsightTypes.filter((type) =>
        ['SUMMARY', 'REPORT', 'FORECAST', 'RECOMMENDATION'].includes(type),
      ),
      modelModes: aiModelModes,
      scenarios: ['Attendance exception recap', 'Payroll signal review', 'Recruitment backlog'],
      suggestedPrompts: [
        'Summarize attendance anomalies by department.',
        'Forecast payroll pressure for next month.',
        'Recommend HR actions for overdue recruitment tasks.',
      ],
    };
  }
}
