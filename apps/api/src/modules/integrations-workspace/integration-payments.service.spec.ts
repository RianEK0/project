import { describe, expect, it } from 'vitest';

import { IntegrationPaymentsService } from './integration-payments.service';

describe('IntegrationPaymentsService', () => {
  const service = new IntegrationPaymentsService();

  it('marks the payments portfolio as ready when provider and reconciliation coverage are strong', () => {
    const preview = service.previewPortfolio({
      providersExpected: 3,
      webhookEndpointsExpected: 3,
      webhookEndpointsReady: 3,
      settlementMatchRatePct: 97,
      ledgerRoutingCoveragePct: 95,
      providers: [
        {
          key: 'STRIPE',
          label: 'Stripe',
          authModes: ['API_KEY', 'WEBHOOK_SIGNATURE'],
          readinessPct: 95,
          webhookReady: true,
          routeCount: 3,
          primaryUseCase: 'Global card and subscription collection',
          nextFocus: 'Expand refund and dispute automation.',
        },
        {
          key: 'XENDIT',
          label: 'Xendit',
          authModes: ['API_KEY', 'WEBHOOK_SIGNATURE'],
          readinessPct: 91,
          webhookReady: true,
          routeCount: 3,
          primaryUseCase: 'Indonesia virtual account and QRIS flows',
          nextFocus: 'Add payout and disbursement readiness checks.',
        },
        {
          key: 'MIDTRANS',
          label: 'Midtrans',
          authModes: ['API_KEY', 'WEBHOOK_SIGNATURE'],
          readinessPct: 90,
          webhookReady: true,
          routeCount: 2,
          primaryUseCase: 'Regional checkout fallback',
          nextFocus: 'Standardize order-status mapping.',
        },
      ],
    });

    expect(preview.status).toBe('READY');
    expect(preview.connectedProviders).toBe(3);
  });

  it('blocks a provider when webhook coverage is missing', () => {
    const preview = service.previewPortfolio({
      providersExpected: 3,
      webhookEndpointsExpected: 3,
      webhookEndpointsReady: 1,
      settlementMatchRatePct: 58,
      ledgerRoutingCoveragePct: 61,
      providers: [
        {
          key: 'STRIPE',
          label: 'Stripe',
          authModes: ['API_KEY', 'WEBHOOK_SIGNATURE'],
          readinessPct: 76,
          webhookReady: false,
          routeCount: 3,
          primaryUseCase: 'Global card and subscription collection',
          nextFocus: 'Enable signed event intake.',
        },
      ],
    });

    expect(preview.providers[0]?.status).toBe('BLOCKED');
    expect(preview.status).toBe('LIMITED');
  });
});
