import { Module } from '@nestjs/common';

import { AiRecommendationPriorityService } from './ai-recommendation-priority.service';
import { AiRecommendationsController } from './ai-recommendations.controller';

@Module({
  controllers: [AiRecommendationsController],
  providers: [AiRecommendationPriorityService],
})
export class AiRecommendationsModule {}
