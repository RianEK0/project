import { describe, expect, it } from 'vitest';

import { DepreciationScheduleService } from './depreciation-schedule.service';

describe('DepreciationScheduleService', () => {
  const service = new DepreciationScheduleService();

  it('builds a straight-line schedule for the full useful life', () => {
    const preview = service.previewSchedule({
      acquisitionCost: 1200,
      residualValue: 0,
      usefulLifeMonths: 12,
      inServiceDate: '2026-07-01T00:00:00.000Z',
      method: 'STRAIGHT_LINE',
    });

    expect(preview.schedule).toHaveLength(12);
    expect(preview.monthlyDepreciationAmount).toBe(100);
    expect(preview.schedule.at(-1)?.endingBookValue).toBe(0);
  });

  it('rejects unsupported depreciation preview methods', () => {
    expect(() =>
      service.previewSchedule({
        acquisitionCost: 1000,
        residualValue: 100,
        usefulLifeMonths: 10,
        inServiceDate: '2026-07-01T00:00:00.000Z',
        method: 'DECLINING_BALANCE',
      }),
    ).toThrowError(/not supported in this foundation/i);
  });

  it('rejects invalid residual or useful-life combinations', () => {
    expect(() =>
      service.previewSchedule({
        acquisitionCost: 1000,
        residualValue: 1000,
        usefulLifeMonths: 12,
        inServiceDate: '2026-07-01T00:00:00.000Z',
        method: 'STRAIGHT_LINE',
      }),
    ).toThrowError(/residual value lower than acquisition cost/i);
  });
});
