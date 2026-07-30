import { describe, expect, it } from 'vitest';

import { CustomerTimelineService } from './customer-timeline.service';

describe('CustomerTimelineService', () => {
  const service = new CustomerTimelineService();

  it('sorts customer events newest first and counts channels', () => {
    const summary = service.compose([
      {
        id: 'lead-created',
        occurredAt: '2026-07-18T09:00:00.000Z',
        type: 'LEAD_CREATED',
      },
      {
        id: 'wa-sent',
        occurredAt: '2026-07-20T08:30:00.000Z',
        type: 'WHATSAPP_SENT',
        channel: 'WHATSAPP',
      },
      {
        id: 'email-sent',
        occurredAt: '2026-07-19T10:00:00.000Z',
        type: 'EMAIL_SENT',
        channel: 'EMAIL',
      },
    ]);

    expect(summary.entries[0]?.id).toBe('wa-sent');
    expect(summary.channelCounts.WHATSAPP).toBe(1);
    expect(summary.channelCounts.EMAIL).toBe(1);
  });

  it('requires at least one event', () => {
    expect(() => service.compose([])).toThrowError(/requires at least one event/i);
  });
});
