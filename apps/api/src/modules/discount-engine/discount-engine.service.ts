import { HttpStatus, Injectable } from '@nestjs/common';
import { type DiscountRuleType, type DiscountTarget } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

export type DiscountEngineLineInput = {
  lineId: string;
  quantity: number;
  unitPrice: number;
};

export type DiscountEngineRule = {
  ruleId: string;
  ruleType: DiscountRuleType;
  target: DiscountTarget;
  value: number;
  minQuantity?: number;
  buyQuantity?: number;
  freeQuantity?: number;
  maxDiscountAmount?: number;
};

export type DiscountEngineSummary = {
  subtotal: number;
  lineDiscountTotal: number;
  orderDiscountTotal: number;
  grandDiscountTotal: number;
  lineSummaries: Array<{
    lineId: string;
    subtotal: number;
    discount: number;
  }>;
  appliedRuleIds: string[];
};

@Injectable()
export class DiscountEngineService {
  evaluate(
    lines: readonly DiscountEngineLineInput[],
    rules: readonly DiscountEngineRule[],
  ): DiscountEngineSummary {
    if (lines.length === 0) {
      throw new AppException(
        ERROR_CODES.DISCOUNT_RULE_INVALID,
        'Discount evaluation requires at least one line.',
        HttpStatus.CONFLICT,
      );
    }

    const lineLevelRules = rules.filter((rule) => rule.target !== 'ORDER');
    const orderLevelRules = rules.filter((rule) => rule.target === 'ORDER');
    const appliedRuleIds = new Set<string>();

    const lineSummaries = lines.map((line) => {
      this.assertLine(line);

      const subtotal = this.round(line.quantity * line.unitPrice);
      const rawDiscount = lineLevelRules.reduce((total, rule) => {
        const ruleDiscount = this.evaluateRule(rule, line.quantity, line.unitPrice, subtotal);

        if (ruleDiscount > 0) {
          appliedRuleIds.add(rule.ruleId);
        }

        return total + ruleDiscount;
      }, 0);
      const discount = this.round(Math.min(rawDiscount, subtotal));

      return {
        lineId: line.lineId,
        subtotal,
        discount,
      };
    });

    const subtotal = this.round(
      lineSummaries.reduce((total, lineSummary) => total + lineSummary.subtotal, 0),
    );
    const lineDiscountTotal = this.round(
      lineSummaries.reduce((total, lineSummary) => total + lineSummary.discount, 0),
    );
    const orderDiscountBase = this.round(subtotal - lineDiscountTotal);
    const rawOrderDiscountTotal = orderLevelRules.reduce((total, rule) => {
      const ruleDiscount = this.evaluateRule(rule, 1, orderDiscountBase, orderDiscountBase);

      if (ruleDiscount > 0) {
        appliedRuleIds.add(rule.ruleId);
      }

      return total + ruleDiscount;
    }, 0);
    const orderDiscountTotal = this.round(Math.min(rawOrderDiscountTotal, orderDiscountBase));

    return {
      subtotal,
      lineDiscountTotal,
      orderDiscountTotal,
      grandDiscountTotal: this.round(lineDiscountTotal + orderDiscountTotal),
      lineSummaries,
      appliedRuleIds: [...appliedRuleIds],
    };
  }

  private evaluateRule(
    rule: DiscountEngineRule,
    quantity: number,
    unitPrice: number,
    subtotal: number,
  ): number {
    this.assertRule(rule);

    const capped = (value: number) =>
      this.round(Math.min(value, rule.maxDiscountAmount ?? value, subtotal));

    switch (rule.ruleType) {
      case 'PERCENTAGE':
        return capped(subtotal * (rule.value / 100));
      case 'FIXED_AMOUNT':
      case 'MANUAL_OVERRIDE':
        return capped(rule.value);
      case 'TIERED':
        return quantity >= (rule.minQuantity ?? 0) ? capped(subtotal * (rule.value / 100)) : 0;
      case 'BUY_X_GET_Y': {
        const buyQuantity = rule.buyQuantity ?? 0;
        const freeQuantity = rule.freeQuantity ?? 0;

        if (buyQuantity <= 0 || freeQuantity <= 0) {
          throw new AppException(
            ERROR_CODES.DISCOUNT_RULE_INVALID,
            'BUY_X_GET_Y rules require positive buy and free quantities.',
            HttpStatus.BAD_REQUEST,
          );
        }

        const freeUnits = Math.floor(quantity / (buyQuantity + freeQuantity)) * freeQuantity;

        return capped(freeUnits * unitPrice);
      }
      default:
        return 0;
    }
  }

  private assertLine(line: DiscountEngineLineInput): void {
    if (line.quantity <= 0 || line.unitPrice < 0) {
      throw new AppException(
        ERROR_CODES.DISCOUNT_RULE_INVALID,
        'Discount engine lines require positive quantity and non-negative price.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private assertRule(rule: DiscountEngineRule): void {
    if (rule.value < 0) {
      throw new AppException(
        ERROR_CODES.DISCOUNT_RULE_INVALID,
        'Discount rule value must be non-negative.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
