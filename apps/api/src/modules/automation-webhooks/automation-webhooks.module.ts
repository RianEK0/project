import { Module } from '@nestjs/common';

import { AutomationWebhooksController } from './automation-webhooks.controller';
import { WebhookDeliveryPolicyService } from './webhook-delivery-policy.service';

@Module({
  controllers: [AutomationWebhooksController],
  providers: [WebhookDeliveryPolicyService],
})
export class AutomationWebhooksModule {}
