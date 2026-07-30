import { describe, expect, it } from 'vitest';

import { BookingStatusTransitionService } from './booking-status-transition.service';

describe('BookingStatusTransitionService', () => {
  const service = new BookingStatusTransitionService();

  it('allows linear operational transitions', () => {
    expect(service.canTransition('PENDING', 'CONFIRMED')).toBe(true);
    expect(service.canTransition('CHECKED_IN', 'IN_PROGRESS')).toBe(true);
    expect(service.canTransition('IN_PROGRESS', 'COMPLETED')).toBe(true);
  });

  it('blocks illegal transitions', () => {
    expect(service.canTransition('CANCELLED', 'CHECKED_IN')).toBe(false);
    expect(service.canTransition('COMPLETED', 'CONFIRMED')).toBe(false);
  });

  it('throws for invalid transitions', () => {
    expect(() => service.assertTransition('PAID', 'PENDING')).toThrowError(
      /transition from PAID to PENDING is not allowed/i,
    );
  });
});
