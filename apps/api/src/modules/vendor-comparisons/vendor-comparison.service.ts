import { HttpStatus, Injectable } from '@nestjs/common';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type NumericLike = number | string;

export type SupplierQuotationCandidate = {
  quotationId: string;
  supplierId: string;
  supplierName: string;
  unitPrice: NumericLike;
  leadTimeDays: number;
  qualityScore?: number;
  onTimeRate?: number;
};

export type VendorComparisonWeights = {
  price: number;
  leadTime: number;
  quality: number;
  onTime: number;
};

export type VendorComparisonResult = {
  recommendedQuotationId: string;
  rankings: Array<{
    quotationId: string;
    supplierId: string;
    supplierName: string;
    totalScore: number;
    rank: number;
    recommended: boolean;
    rationale: string[];
  }>;
};

const defaultWeights: VendorComparisonWeights = {
  price: 0.5,
  leadTime: 0.2,
  quality: 0.15,
  onTime: 0.15,
};

@Injectable()
export class VendorComparisonService {
  compare(
    quotations: readonly SupplierQuotationCandidate[],
    weights: Partial<VendorComparisonWeights> = {},
  ): VendorComparisonResult {
    if (quotations.length < 2) {
      throw new AppException(
        ERROR_CODES.VENDOR_COMPARISON_NOT_READY,
        'At least two supplier quotations are required before comparison can run.',
        HttpStatus.CONFLICT,
      );
    }

    const normalizedWeights = this.normalizeWeights(weights);
    const prices = quotations.map((quotation) => this.parse(quotation.unitPrice));
    const leadTimes = quotations.map((quotation) => quotation.leadTimeDays);
    const qualityScores = quotations.map((quotation) => quotation.qualityScore ?? 80);
    const onTimeRates = quotations.map((quotation) => quotation.onTimeRate ?? 85);

    const rankings = quotations
      .map((quotation, index) => {
        const price = prices[index]!;
        const leadTime = leadTimes[index]!;
        const quality = qualityScores[index]!;
        const onTime = onTimeRates[index]!;
        const priceScore = this.lowestWins(price, prices);
        const leadTimeScore = this.lowestWins(leadTime, leadTimes);
        const qualityScore = this.highestWins(quality, qualityScores);
        const onTimeScore = this.highestWins(onTime, onTimeRates);
        const totalScore =
          priceScore * normalizedWeights.price +
          leadTimeScore * normalizedWeights.leadTime +
          qualityScore * normalizedWeights.quality +
          onTimeScore * normalizedWeights.onTime;
        const rationale: string[] = [];

        if (price === Math.min(...prices)) {
          rationale.push('Lowest evaluated unit price');
        }
        if (leadTime === Math.min(...leadTimes)) {
          rationale.push('Fastest quoted lead time');
        }
        if (quality >= Math.max(...qualityScores)) {
          rationale.push('Highest available quality score');
        }
        if (onTime >= Math.max(...onTimeRates)) {
          rationale.push('Best historical on-time rate');
        }

        return {
          quotationId: quotation.quotationId,
          supplierId: quotation.supplierId,
          supplierName: quotation.supplierName,
          totalScore: this.round(totalScore),
          rationale,
        };
      })
      .sort((left, right) => right.totalScore - left.totalScore)
      .map((ranking, index) => ({
        ...ranking,
        rank: index + 1,
        recommended: index === 0,
      }));

    return {
      recommendedQuotationId: rankings[0]!.quotationId,
      rankings,
    };
  }

  private normalizeWeights(weights: Partial<VendorComparisonWeights>): VendorComparisonWeights {
    const merged = {
      ...defaultWeights,
      ...weights,
    };
    const total = merged.price + merged.leadTime + merged.quality + merged.onTime;

    if (total <= 0) {
      throw new AppException(
        ERROR_CODES.VENDOR_COMPARISON_NOT_READY,
        'Comparison weights must sum to a positive number.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      price: merged.price / total,
      leadTime: merged.leadTime / total,
      quality: merged.quality / total,
      onTime: merged.onTime / total,
    };
  }

  private lowestWins(value: number, series: readonly number[]): number {
    const min = Math.min(...series);
    const max = Math.max(...series);

    if (min === max) {
      return 100;
    }

    return this.round(((max - value) / (max - min)) * 100);
  }

  private highestWins(value: number, series: readonly number[]): number {
    const min = Math.min(...series);
    const max = Math.max(...series);

    if (min === max) {
      return 100;
    }

    return this.round(((value - min) / (max - min)) * 100);
  }

  private parse(value: NumericLike): number {
    const parsed = typeof value === 'number' ? value : Number.parseFloat(value);

    if (!Number.isFinite(parsed)) {
      throw new AppException(
        ERROR_CODES.VENDOR_COMPARISON_NOT_READY,
        'Vendor comparison input must be numeric.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return parsed;
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
