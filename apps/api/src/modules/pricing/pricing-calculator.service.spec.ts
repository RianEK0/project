import { describe, expect, it } from 'vitest';

import { PricingCalculatorService } from './pricing-calculator.service';

describe('PricingCalculatorService', () => {
  const service = new PricingCalculatorService();

  it('applies percentage discounts deterministically', () => {
    expect(service.applyAdjustment(200_000, 'PERCENT_DISCOUNT', 10)).toBe(180_000);
  });

  it('supports fixed price overrides', () => {
    expect(service.applyAdjustment(200_000, 'FIXED_PRICE', 150_000)).toBe(150_000);
  });

  it('calculates booking totals from pricing lines', () => {
    expect(
      service.calculateTotals([
        {
          quantity: 1,
          unitPrice: 175_000,
          discountAmount: 17_500,
          taxAmount: 17_325,
        },
        {
          quantity: 1,
          unitPrice: 50_000,
          feeAmount: 2_500,
        },
      ]),
    ).toEqual({
      subtotal: 225_000,
      discountTotal: 17_500,
      taxTotal: 17_325,
      feeTotal: 2_500,
      grandTotal: 227_325,
    });
  });
});
