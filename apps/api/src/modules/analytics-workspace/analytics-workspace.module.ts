import { Module } from '@nestjs/common';

import { AnalyticsDomainOperationsService } from './analytics-domain-operations.service';
import { AnalyticsEntityIntelligenceService } from './analytics-entity-intelligence.service';
import { AnalyticsRealtimeService } from './analytics-realtime.service';
import { AnalyticsSemanticModelService } from './analytics-semantic-model.service';
import { AnalyticsWorkspaceController } from './analytics-workspace.controller';

@Module({
  controllers: [AnalyticsWorkspaceController],
  providers: [
    AnalyticsDomainOperationsService,
    AnalyticsEntityIntelligenceService,
    AnalyticsSemanticModelService,
    AnalyticsRealtimeService,
  ],
})
export class AnalyticsWorkspaceModule {}
