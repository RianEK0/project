import { describe, expect, it } from 'vitest';

import { IntegrationMessagingService } from './integration-messaging.service';

describe('IntegrationMessagingService', () => {
  const service = new IntegrationMessagingService();

  it('marks the messaging portfolio as ready when callbacks and automation coverage are healthy', () => {
    const preview = service.previewPortfolio({
      providersExpected: 4,
      deliveryVisibilityPct: 93,
      automationBindingPct: 90,
      incomingWebhookCoveragePct: 88,
      providers: [
        {
          key: 'WHATSAPP',
          label: 'WhatsApp',
          authModes: ['API_KEY', 'WEBHOOK_SIGNATURE'],
          readinessPct: 90,
          callbackReady: true,
          routeCount: 3,
          primaryUseCase: 'Customer messaging and operational alerts',
          nextFocus: 'Add template approval monitoring.',
        },
        {
          key: 'SLACK',
          label: 'Slack',
          authModes: ['BOT_TOKEN', 'WEBHOOK_SIGNATURE'],
          readinessPct: 92,
          callbackReady: true,
          routeCount: 2,
          primaryUseCase: 'Internal notification fan-out',
          nextFocus: 'Expand acknowledgement shortcuts.',
        },
        {
          key: 'TELEGRAM',
          label: 'Telegram',
          authModes: ['BOT_TOKEN', 'WEBHOOK_SIGNATURE'],
          readinessPct: 89,
          callbackReady: true,
          routeCount: 2,
          primaryUseCase: 'Operational bot relay and alerting',
          nextFocus: 'Add bot command policy defaults.',
        },
        {
          key: 'DISCORD',
          label: 'Discord',
          authModes: ['BOT_TOKEN', 'WEBHOOK_SIGNATURE'],
          readinessPct: 90,
          callbackReady: true,
          routeCount: 2,
          primaryUseCase: 'Community and support escalation broadcasts',
          nextFocus: 'Expand moderation and escalation templates.',
        },
      ],
    });

    expect(preview.status).toBe('READY');
  });

  it('marks a provider as blocked when callbacks are missing', () => {
    const preview = service.previewPortfolio({
      providersExpected: 4,
      deliveryVisibilityPct: 52,
      automationBindingPct: 47,
      incomingWebhookCoveragePct: 35,
      providers: [
        {
          key: 'TELEGRAM',
          label: 'Telegram',
          authModes: ['BOT_TOKEN', 'WEBHOOK_SIGNATURE'],
          readinessPct: 70,
          callbackReady: false,
          routeCount: 2,
          primaryUseCase: 'Ops bot and exception relay',
          nextFocus: 'Enable callback verification and bot health checks.',
        },
      ],
    });

    expect(preview.providers[0]?.status).toBe('BLOCKED');
    expect(preview.status).toBe('LIMITED');
  });
});
