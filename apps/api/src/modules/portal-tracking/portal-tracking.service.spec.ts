import { describe, expect, it } from 'vitest';

import { PortalTrackingService } from './portal-tracking.service';

describe('PortalTrackingService', () => {
  const service = new PortalTrackingService();

  it('returns every supported entity type for customer-facing tracking', () => {
    expect(service.getEntityTypes()).toContain('BOOKING');
    expect(service.getEntityTypes()).toContain('TICKET');
  });

  it('keeps the timeline sorted chronologically', () => {
    const timeline = service.getTimeline();
    const firstEvent = timeline[0];
    const lastEvent = timeline[timeline.length - 1];

    expect(firstEvent).toBeDefined();
    expect(lastEvent).toBeDefined();
    expect(firstEvent!.occurredAt <= lastEvent!.occurredAt).toBe(true);
  });

  it('surfaces exception events for customer attention', () => {
    expect(service.getExceptionEvents()).toHaveLength(1);
    expect(service.getExceptionEvents()[0]?.entityType).toBe('TICKET');
  });
});
