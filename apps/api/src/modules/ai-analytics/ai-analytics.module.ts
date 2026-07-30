import { Module } from '@nestjs/common';

import { AiAnalyticsController } from './ai-analytics.controller';

@Module({
  controllers: [AiAnalyticsController],
})
export class AiAnalyticsModule {}
