import { describe, expect, it } from 'vitest';

import { LeaveBalanceService } from './leave-balance.service';

describe('LeaveBalanceService', () => {
  const service = new LeaveBalanceService();

  it('calculates remaining leave after taken and pending requests', () => {
    expect(
      service.previewBalance({
        annualEntitlementDays: 12,
        carryForwardDays: 2,
        takenDays: 4,
        pendingDays: 3,
        requestedDays: 2,
      }),
    ).toEqual({
      availableDays: 10,
      pendingDays: 3,
      remainingDays: 7,
      requestable: true,
    });
  });

  it('blocks requests that exceed the remaining balance', () => {
    expect(() =>
      service.assertSufficientBalance({
        annualEntitlementDays: 12,
        carryForwardDays: 0,
        takenDays: 7,
        pendingDays: 3,
        requestedDays: 4,
      }),
    ).toThrowError(/remaining leave balance/i);
  });
});
