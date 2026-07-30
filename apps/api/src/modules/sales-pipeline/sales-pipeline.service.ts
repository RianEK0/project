import { HttpStatus, Injectable } from '@nestjs/common';
import { salesPipelineStages, type SalesPipelineStage } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type NumericLike = number | string;

export type SalesPipelineSnapshot = {
  stage: SalesPipelineStage;
  openCount: NumericLike;
  openValue?: NumericLike | null;
  probabilityPct?: NumericLike | null;
  stalledDays?: NumericLike | null;
};

export type SalesPipelineSummary = {
  totalOpenCount: number;
  totalOpenValue: number;
  weightedOpenValue: number;
  winRate: number;
  stalledStage: SalesPipelineStage | null;
  stageMix: Array<{
    stage: SalesPipelineStage;
    openCount: number;
    openValue: number;
    weightedValue: number;
    stalledDays: number;
  }>;
};

const defaultProbabilities: Record<SalesPipelineStage, number> = {
  LEAD: 10,
  OPPORTUNITY: 25,
  QUOTATION: 55,
  NEGOTIATION: 80,
  WON: 100,
  LOST: 0,
};

@Injectable()
export class SalesPipelineService {
  getDefaultProbabilities(): Record<SalesPipelineStage, number> {
    return { ...defaultProbabilities };
  }

  summarize(snapshot: readonly SalesPipelineSnapshot[]): SalesPipelineSummary {
    if (snapshot.length === 0) {
      throw new AppException(
        ERROR_CODES.SALES_PIPELINE_NOT_FOUND,
        'Sales pipeline summary requires at least one stage snapshot.',
        HttpStatus.CONFLICT,
      );
    }

    const stageMap = new Map(snapshot.map((item) => [item.stage, item]));
    const stageMix = salesPipelineStages.map((stage) => {
      const item = stageMap.get(stage);
      const openCount = this.parse(item?.openCount ?? 0);
      const openValue = this.parse(item?.openValue ?? 0);
      const probabilityPct = this.parse(item?.probabilityPct ?? defaultProbabilities[stage]);
      const stalledDays = this.parse(item?.stalledDays ?? 0);

      return {
        stage,
        openCount,
        openValue,
        weightedValue: this.round(openValue * (probabilityPct / 100)),
        stalledDays,
      };
    });
    const openStageMix = stageMix.filter((item) => !['WON', 'LOST'].includes(item.stage));

    const totalOpenCount = openStageMix.reduce((total, item) => total + item.openCount, 0);
    const totalOpenValue = openStageMix.reduce((total, item) => total + item.openValue, 0);
    const weightedOpenValue = openStageMix.reduce((total, item) => total + item.weightedValue, 0);
    const wonCount = stageMix.find((item) => item.stage === 'WON')?.openCount ?? 0;
    const lostCount = stageMix.find((item) => item.stage === 'LOST')?.openCount ?? 0;
    const stalledStage =
      [...openStageMix].sort((left, right) => right.stalledDays - left.stalledDays)[0]?.stage ??
      null;

    return {
      totalOpenCount,
      totalOpenValue: this.round(totalOpenValue),
      weightedOpenValue: this.round(weightedOpenValue),
      winRate:
        wonCount + lostCount === 0 ? 0 : this.round((wonCount / (wonCount + lostCount)) * 100),
      stalledStage,
      stageMix,
    };
  }

  private parse(value: NumericLike | null | undefined): number {
    const resolvedValue = value ?? 0;
    const parsed =
      typeof resolvedValue === 'number' ? resolvedValue : Number.parseFloat(resolvedValue);

    if (!Number.isFinite(parsed)) {
      throw new AppException(
        ERROR_CODES.SALES_PIPELINE_NOT_FOUND,
        'Sales pipeline input must be numeric.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return parsed;
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
