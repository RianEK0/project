import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { aiInsightTypes } from '@nova/shared-types';

import { AiRecommendationPriorityService } from './ai-recommendation-priority.service';

@ApiTags('AI Recommendations')
@Controller({
  path: 'ai-recommendations',
  version: '1',
})
export class AiRecommendationsController {
  constructor(private readonly aiRecommendationPriorityService: AiRecommendationPriorityService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: this.aiRecommendationPriorityService.getStatuses(),
      priorities: this.aiRecommendationPriorityService.getPriorities(),
      insightTypes: aiInsightTypes.filter((type) =>
        ['RECOMMENDATION', 'ANOMALY', 'SUMMARY'].includes(type),
      ),
      actionBuckets: ['Immediate', 'This week', 'Planned', 'Monitor'],
    };
  }

  @Get('priority-preview')
  getPriorityPreview() {
    return this.aiRecommendationPriorityService.rank([
      {
        title: 'Escalate blocked purchase orders',
        impactScore: 95,
        urgencyScore: 80,
        confidenceScore: 70,
      },
      {
        title: 'Rebalance work center load',
        impactScore: 82,
        urgencyScore: 72,
        confidenceScore: 85,
      },
      {
        title: 'Refresh standard dashboard digest',
        impactScore: 50,
        urgencyScore: 40,
        confidenceScore: 90,
      },
    ]);
  }
}
