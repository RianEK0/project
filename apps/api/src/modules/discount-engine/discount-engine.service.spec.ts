import { describe, expect, it } from 'vitest';

import { DiscountEngineService } from './discount-engine.service';

describe('DiscountEngineService', () => {
  const service = new DiscountEngineService();

  it('combines line-level and order-level discounts', () => {
    const result = service.evaluate(
      [{ lineId: 'line-1', quantity: 6, unitPrice: 100 }],
      [
        {
          ruleId: 'tiered-10',
          ruleType: 'TIERED',
          target: 'LINE',
          value: 10,
          minQuantity: 5,
        },
        {
          ruleId: 'order-5',
          ruleType: 'PERCENTAGE',
          target: 'ORDER',
          value: 5,
        },
      ],
    );

    expect(result.lineDiscountTotal).toBe(60);
    expect(result.orderDiscountTotal).toBe(27);
    expect(result.grandDiscountTotal).toBe(87);
  });

  it('supports buy-x-get-y rules', () => {
    const result = service.evaluate(
      [{ lineId: 'line-1', quantity: 7, unitPrice: 50 }],
      [
        {
          ruleId: 'bxgy',
          ruleType: 'BUY_X_GET_Y',
          target: 'LINE',
          value: 0,
          buyQuantity: 2,
          freeQuantity: 1,
        },
      ],
    );

    expect(result.lineDiscountTotal).toBe(100);
  });

  it('rejects invalid discount inputs', () => {
    expect(() =>
      service.evaluate([{ lineId: 'broken', quantity: 0, unitPrice: 100 }], []),
    ).toThrowError(/require positive quantity/i);
  });
});
