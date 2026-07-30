import { Module } from '@nestjs/common';

import { IntegrationAiService } from './integration-ai.service';
import { IntegrationMessagingService } from './integration-messaging.service';
import { IntegrationPaymentsService } from './integration-payments.service';
import { IntegrationStorageService } from './integration-storage.service';
import { IntegrationSuiteService } from './integration-suite.service';
import { IntegrationsWorkspaceController } from './integrations-workspace.controller';

@Module({
  controllers: [IntegrationsWorkspaceController],
  providers: [
    IntegrationPaymentsService,
    IntegrationSuiteService,
    IntegrationMessagingService,
    IntegrationStorageService,
    IntegrationAiService,
  ],
})
export class IntegrationsWorkspaceModule {}
