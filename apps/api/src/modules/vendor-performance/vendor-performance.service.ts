import { HttpStatus, Injectable } from '@nestjs/common';
import { type VendorLeadTimeTrend, type VendorRatingLevel } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type NumericLike = number | string;

export type VendorPerformanceReceipt = {
  leadTimeDays: NumericLike;
  promisedLeadTimeDays?: NumericLike | null;
  quotedUnitPrice?: NumericLike | null;
  actualUnitPrice?: NumericLike | null;
  receivedQuantity: NumericLike;
  rejectedQuantity?: NumericLike | null;
};

export type VendorPerformanceSummary = {
  averageLeadTimeDays: number;
  onTimeRate: number;
  averagePriceVariancePct: number;
  acceptanceRate: number;
  ratingLevel: VendorRatingLevel;
  leadTimeTrend: VendorLeadTimeTrend;
};

@Injectable()
export class VendorPerformanceService {
  evaluate(
    receipts: readonly VendorPerformanceReceipt[],
    previousAverageLeadTimeDays?: NumericLike,
  ): VendorPerformanceSummary {
    if (receipts.length === 0) {
      throw new AppException(
        ERROR_CODES.VENDOR_RATING_NOT_FOUND,
        'Vendor performance requires at least one completed receipt snapshot.',
        HttpStatus.CONFLICT,
      );
    }

    const leadTimes = receipts.map((receipt) => this.parse(receipt.leadTimeDays));
    const averageLeadTimeDays = this.average(leadTimes);
    const onTimeRate = this.average(
      receipts.map((receipt) => {
        const promised = receipt.promisedLeadTimeDays
          ? this.parse(receipt.promisedLeadTimeDays)
          : this.parse(receipt.leadTimeDays);

        return this.parse(receipt.leadTimeDays) <= promised ? 100 : 0;
      }),
    );
    const acceptanceRate = this.average(
      receipts.map((receipt) => {
        const received = this.parse(receipt.receivedQuantity);
        const rejected = this.parse(receipt.rejectedQuantity ?? 0);

        return received <= 0 ? 100 : ((received - rejected) / received) * 100;
      }),
    );
    const priceVarianceSeries = receipts
      .filter(
        (receipt) =>
          receipt.quotedUnitPrice !== undefined &&
          receipt.quotedUnitPrice !== null &&
          receipt.actualUnitPrice !== undefined &&
          receipt.actualUnitPrice !== null,
      )
      .map((receipt) => {
        const quoted = this.parse(receipt.quotedUnitPrice!);
        const actual = this.parse(receipt.actualUnitPrice!);

        return quoted === 0 ? 0 : ((actual - quoted) / quoted) * 100;
      });
    const averagePriceVariancePct = priceVarianceSeries.length
      ? this.average(priceVarianceSeries)
      : 0;
    const ratingLevel = this.toRatingLevel(onTimeRate, acceptanceRate, averagePriceVariancePct);
    const leadTimeTrend = this.toLeadTimeTrend(averageLeadTimeDays, previousAverageLeadTimeDays);

    return {
      averageLeadTimeDays: this.round(averageLeadTimeDays),
      onTimeRate: this.round(onTimeRate),
      averagePriceVariancePct: this.round(averagePriceVariancePct),
      acceptanceRate: this.round(acceptanceRate),
      ratingLevel,
      leadTimeTrend,
    };
  }

  private toRatingLevel(
    onTimeRate: number,
    acceptanceRate: number,
    priceVariancePct: number,
  ): VendorRatingLevel {
    const variance = Math.abs(priceVariancePct);

    if (onTimeRate >= 95 && acceptanceRate >= 98 && variance <= 2) {
      return 'PREFERRED';
    }
    if (onTimeRate >= 85 && acceptanceRate >= 95 && variance <= 5) {
      return 'APPROVED';
    }
    if (onTimeRate >= 70 && acceptanceRate >= 90 && variance <= 8) {
      return 'CONDITIONAL';
    }
    if (onTimeRate >= 50 && acceptanceRate >= 80) {
      return 'WATCHLIST';
    }

    return 'BLOCKED';
  }

  private toLeadTimeTrend(
    averageLeadTimeDays: number,
    previousAverageLeadTimeDays?: NumericLike,
  ): VendorLeadTimeTrend {
    if (previousAverageLeadTimeDays === undefined) {
      return 'STABLE';
    }

    const previous = this.parse(previousAverageLeadTimeDays);

    if (averageLeadTimeDays < previous - 0.5) {
      return 'IMPROVING';
    }
    if (averageLeadTimeDays > previous + 0.5) {
      return 'WORSENING';
    }

    return 'STABLE';
  }

  private average(values: readonly number[]): number {
    return values.reduce((total, value) => total + value, 0) / values.length;
  }

  private parse(value: NumericLike): number {
    const parsed = typeof value === 'number' ? value : Number.parseFloat(value);

    if (!Number.isFinite(parsed)) {
      throw new AppException(
        ERROR_CODES.VENDOR_RATING_NOT_FOUND,
        'Vendor performance input must be numeric.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return parsed;
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
