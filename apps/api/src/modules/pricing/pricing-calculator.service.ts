import { Injectable } from '@nestjs/common';
import type { PriceAdjustmentType } from '@nova/shared-types';

export type PricingLineInput = {
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  taxAmount?: number;
  feeAmount?: number;
};

export type PricingTotals = {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  feeTotal: number;
  grandTotal: number;
};

@Injectable()
export class PricingCalculatorService {
  applyAdjustment(baseAmount: number, adjustmentType: PriceAdjustmentType, adjustmentValue: number): number {
    switch (adjustmentType) {
      case 'FIXED_PRICE':
        return this.roundAmount(adjustmentValue);
      case 'FIXED_ADDITION':
        return this.roundAmount(baseAmount + adjustmentValue);
      case 'FIXED_DISCOUNT':
        return this.roundAmount(Math.max(baseAmount - adjustmentValue, 0));
      case 'PERCENT_ADDITION':
        return this.roundAmount(baseAmount + baseAmount * (adjustmentValue / 100));
      case 'PERCENT_DISCOUNT':
        return this.roundAmount(Math.max(baseAmount - baseAmount * (adjustmentValue / 100), 0));
      default:
        return this.roundAmount(baseAmount);
    }
  }

  calculateTotals(lines: PricingLineInput[]): PricingTotals {
    return lines.reduce<PricingTotals>(
      (accumulator, line) => {
        const lineSubtotal = this.roundAmount(line.quantity * line.unitPrice);
        const lineDiscount = this.roundAmount(line.discountAmount ?? 0);
        const lineTax = this.roundAmount(line.taxAmount ?? 0);
        const lineFee = this.roundAmount(line.feeAmount ?? 0);

        return {
          subtotal: this.roundAmount(accumulator.subtotal + lineSubtotal),
          discountTotal: this.roundAmount(accumulator.discountTotal + lineDiscount),
          taxTotal: this.roundAmount(accumulator.taxTotal + lineTax),
          feeTotal: this.roundAmount(accumulator.feeTotal + lineFee),
          grandTotal: this.roundAmount(
            accumulator.grandTotal + lineSubtotal - lineDiscount + lineTax + lineFee,
          ),
        };
      },
      {
        subtotal: 0,
        discountTotal: 0,
        taxTotal: 0,
        feeTotal: 0,
        grandTotal: 0,
      },
    );
  }

  private roundAmount(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
