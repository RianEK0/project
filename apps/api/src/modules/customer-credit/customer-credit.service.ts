import { HttpStatus, Injectable } from '@nestjs/common';
import { type CustomerCreditRiskLevel } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type NumericLike = number | string;

export type CustomerCreditExposureInput = {
  creditLimit: NumericLike;
  openOrderAmount: NumericLike;
  openInvoiceAmount: NumericLike;
  pendingPaymentAmount?: NumericLike | null;
  overdueAmount?: NumericLike | null;
  requestedOrderAmount?: NumericLike | null;
};

export type CustomerCreditSummary = {
  creditLimit: number;
  totalExposure: number;
  availableCredit: number;
  utilizationPct: number;
  overdueAmount: number;
  riskLevel: CustomerCreditRiskLevel;
  canApproveRequestedOrder: boolean;
};

@Injectable()
export class CustomerCreditService {
  summarize(input: CustomerCreditExposureInput): CustomerCreditSummary {
    const creditLimit = this.parse(input.creditLimit);
    const openOrderAmount = this.parse(input.openOrderAmount);
    const openInvoiceAmount = this.parse(input.openInvoiceAmount);
    const pendingPaymentAmount = this.parse(input.pendingPaymentAmount ?? 0);
    const overdueAmount = this.parse(input.overdueAmount ?? 0);
    const requestedOrderAmount = this.parse(input.requestedOrderAmount ?? 0);

    if (creditLimit < 0) {
      throw new AppException(
        ERROR_CODES.CUSTOMER_CREDIT_NOT_FOUND,
        'Customer credit limit must be non-negative.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const totalExposure = this.round(openOrderAmount + openInvoiceAmount - pendingPaymentAmount);
    const availableCredit = this.round(Math.max(creditLimit - totalExposure, 0));
    const utilizationPct =
      creditLimit <= 0
        ? totalExposure > 0
          ? 100
          : 0
        : this.round((totalExposure / creditLimit) * 100);
    const riskLevel = this.toRiskLevel(utilizationPct, overdueAmount, totalExposure > creditLimit);
    const canApproveRequestedOrder =
      requestedOrderAmount <= availableCredit && !['BLOCKED', 'ON_HOLD'].includes(riskLevel);

    return {
      creditLimit,
      totalExposure,
      availableCredit,
      utilizationPct,
      overdueAmount,
      riskLevel,
      canApproveRequestedOrder,
    };
  }

  private toRiskLevel(
    utilizationPct: number,
    overdueAmount: number,
    limitExceeded: boolean,
  ): CustomerCreditRiskLevel {
    if (limitExceeded) {
      return 'BLOCKED';
    }
    if (overdueAmount > 0 || utilizationPct >= 90) {
      return 'ON_HOLD';
    }
    if (utilizationPct >= 75) {
      return 'WATCHLIST';
    }

    return 'AVAILABLE';
  }

  private parse(value: NumericLike): number {
    const parsed = typeof value === 'number' ? value : Number.parseFloat(value);

    if (!Number.isFinite(parsed)) {
      throw new AppException(
        ERROR_CODES.CUSTOMER_CREDIT_NOT_FOUND,
        'Customer credit input must be numeric.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return parsed;
  }

  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
