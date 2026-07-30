import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { aiInsightTypes, aiModelModes, aiRequestStatuses } from '@nova/shared-types';

@ApiTags('Ask Inventory')
@Controller({
  path: 'ask-inventory',
  version: '1',
})
export class AskInventoryController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: aiRequestStatuses,
      primaryDomain: 'INVENTORY',
      insightTypes: aiInsightTypes.filter((type) =>
        ['ANSWER', 'SEARCH', 'RECOMMENDATION'].includes(type),
      ),
      modelModes: aiModelModes,
      supportedQuestions: [
        'Where is stock located by warehouse or lot?',
        'Which items are near reorder point or blocked?',
        'What serial or lot is tied to a disputed receipt?',
      ],
      suggestedPrompts: [
        'Show low-stock items by warehouse.',
        'Find blocked lots for item MOTOR-220V.',
        'Recommend replenishment focus for critical SKUs.',
      ],
    };
  }
}
