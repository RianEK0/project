import { describe, expect, it } from 'vitest';

import { PayrollCycleService } from './payroll-cycle.service';

describe('PayrollCycleService', () => {
  const service = new PayrollCycleService();

  it('builds payroll preview totals from base salary, allowances, and deductions', () => {
    expect(
      service.previewRun({
        employeeCount: 48,
        frequency: 'MONTHLY',
        baseSalaryTotal: 480000000,
        allowanceTotal: 24000000,
        deductionTotal: 6000000,
        periodStart: '2026-07-01',
        periodEnd: '2026-07-31',
      }),
    ).toMatchObject({
      status: 'CALCULATED',
      grossAmount: 504000000,
      deductionAmount: 6000000,
      netAmount: 498000000,
    });
  });

  it('blocks recalculation for finalized payroll runs', () => {
    expect(() => service.assertProcessable('POSTED')).toThrowError(/cannot be recalculated/i);
  });
});
