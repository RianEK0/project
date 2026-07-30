import { describe, expect, it } from 'vitest';

import { WebhookDeliveryPolicyService } from './webhook-delivery-policy.service';

describe('WebhookDeliveryPolicyService', () => {
  const service = new WebhookDeliveryPolicyService();

  it('builds linear retry schedules', () => {
    expect(
      service.previewDelivery({
        endpointName: 'Slack approval relay',
        maxAttempts: 3,
        initialDelayMinutes: 5,
        strategy: 'LINEAR',
      }),
    ).toMatchObject({
      retryScheduleMinutes: [5, 10, 15],
      totalRetryWindowMinutes: 30,
    });
  });

  it('builds exponential retry schedules', () => {
    expect(
      service.previewDelivery({
        endpointName: 'Procurement webhook',
        maxAttempts: 4,
        initialDelayMinutes: 2,
        strategy: 'EXPONENTIAL',
      }),
    ).toMatchObject({
      retryScheduleMinutes: [2, 4, 8, 16],
      totalRetryWindowMinutes: 30,
    });
  });

  it('rejects invalid retry settings', () => {
    expect(() =>
      service.previewDelivery({
        endpointName: 'Broken policy',
        maxAttempts: 0,
        initialDelayMinutes: 0,
        strategy: 'LINEAR',
      }),
    ).toThrowError(/1-10 attempts/i);
  });
});
