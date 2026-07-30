import { describe, expect, it } from 'vitest';

import { SalesAnalyticsService } from './sales-analytics.service';

describe('SalesAnalyticsService', () => {
  const service = new SalesAnalyticsService();

  it('summarizes operational sales ratios and risk signals', () => {
    const summary = service.summarize({
      orderCount: 10,
      deliveredCount: 8,
      invoicedCount: 7,
      returnedCount: 1,
      collectedAmount: 700,
      invoicedAmount: 1000,
      openOrderValue: 5000,
      overdueReceivable: 200,
    });

    expect(summary.fillRate).toBe(80);
    expect(summary.invoiceRate).toBe(70);
    expect(summary.returnRate).toBe(12.5);
    expect(summary.collectionRate).toBe(70);
    expect(summary.riskSignal).toBe('AT_RISK');
  });

  it('returns zero ratios safely when there is no denominator', () => {
    const summary = service.summarize({
      orderCount: 0,
      deliveredCount: 0,
      invoicedCount: 0,
      returnedCount: 0,
      collectedAmount: 0,
      invoicedAmount: 0,
      openOrderValue: 0,
      overdueReceivable: 0,
    });

    expect(summary.fillRate).toBe(0);
    expect(summary.collectionRate).toBe(0);
    expect(summary.riskSignal).toBe('WATCH');
  });
});
