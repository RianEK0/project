import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { automationChannelTypes, automationRunStatuses } from '@nova/shared-types';

import { WebhookDeliveryPolicyService } from './webhook-delivery-policy.service';

@ApiTags('Automation Webhooks')
@Controller({
  path: 'automation-webhooks',
  version: '1',
})
export class AutomationWebhooksController {
  constructor(private readonly webhookDeliveryPolicyService: WebhookDeliveryPolicyService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      channels: automationChannelTypes.filter((channel) => channel === 'WEBHOOK'),
      runStatuses: automationRunStatuses,
      authModes: ['None', 'Bearer token', 'HMAC signature'],
      retryStrategies: ['LINEAR', 'EXPONENTIAL'],
    };
  }

  @Get('delivery-preview')
  getDeliveryPreview() {
    return this.webhookDeliveryPolicyService.previewDelivery({
      endpointName: 'Slack approval relay',
      maxAttempts: 4,
      initialDelayMinutes: 2,
      strategy: 'EXPONENTIAL',
    });
  }
}
