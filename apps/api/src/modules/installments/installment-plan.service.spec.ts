import { describe, expect, it } from 'vitest';

import { InstallmentPlanService } from './installment-plan.service';

describe('InstallmentPlanService', () => {
  const service = new InstallmentPlanService();

  it('splits the principal into a monthly installment schedule', () => {
    const preview = service.preview({
      principalAmount: 1000,
      installmentCount: 3,
      firstDueDate: '2026-07-23T00:00:00.000Z',
      frequency: 'MONTHLY',
    });

    expect(preview.totalAmount).toBe(1000);
    expect(preview.schedule[0]?.amount).toBe(333.33);
    expect(preview.schedule[2]?.amount).toBe(333.34);
    expect(preview.schedule[1]?.dueDate.startsWith('2026-08-23')).toBe(true);
  });

  it('requires positive principal and count', () => {
    expect(() =>
      service.preview({
        principalAmount: 0,
        installmentCount: 3,
        firstDueDate: '2026-07-23T00:00:00.000Z',
        frequency: 'MONTHLY',
      }),
    ).toThrowError(/must be positive/i);
  });
});
