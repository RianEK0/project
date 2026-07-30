import { describe, expect, it } from 'vitest';

import { VendorPerformanceService } from './vendor-performance.service';

describe('VendorPerformanceService', () => {
  const service = new VendorPerformanceService();

  it('derives performance summary and rating', () => {
    const summary = service.evaluate([
      {
        leadTimeDays: 5,
        promisedLeadTimeDays: 6,
        quotedUnitPrice: 100,
        actualUnitPrice: 101,
        receivedQuantity: 100,
        rejectedQuantity: 1,
      },
      {
        leadTimeDays: 6,
        promisedLeadTimeDays: 6,
        quotedUnitPrice: 100,
        actualUnitPrice: 99,
        receivedQuantity: 100,
        rejectedQuantity: 0,
      },
    ]);

    expect(summary.onTimeRate).toBe(100);
    expect(summary.acceptanceRate).toBe(99.5);
    expect(summary.ratingLevel).toBe('PREFERRED');
  });

  it('marks worsening lead time against a previous baseline', () => {
    const summary = service.evaluate(
      [
        {
          leadTimeDays: 9,
          promisedLeadTimeDays: 8,
          receivedQuantity: 50,
        },
      ],
      6,
    );

    expect(summary.leadTimeTrend).toBe('WORSENING');
  });

  it('requires at least one receipt snapshot', () => {
    expect(() => service.evaluate([])).toThrowError(
      /requires at least one completed receipt snapshot/i,
    );
  });
});
