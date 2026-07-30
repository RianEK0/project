import { Module } from '@nestjs/common';

import { AiAssistantsService } from './ai-assistants.service';
import { AiCommandCenterService } from './ai-command-center.service';
import { AiDocumentIntelligenceService } from './ai-document-intelligence.service';
import { AiForecastRiskService } from './ai-forecast-risk.service';
import { AiOptimizationService } from './ai-optimization.service';
import { AiPerceptionService } from './ai-perception.service';
import { AiWorkspaceController } from './ai-workspace.controller';

@Module({
  controllers: [AiWorkspaceController],
  providers: [
    AiCommandCenterService,
    AiForecastRiskService,
    AiOptimizationService,
    AiDocumentIntelligenceService,
    AiPerceptionService,
    AiAssistantsService,
  ],
})
export class AiWorkspaceModule {}
