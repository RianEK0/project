import { Injectable } from '@nestjs/common';
import {
  type DashboardAudience,
  type DashboardSignalTone,
  type DashboardTimeWindow,
} from '@nova/shared-types';

import {
  assertDashboardMetricMin,
  assertDashboardMetricRange,
  roundDashboardMetric,
  selectDashboardSignal,
  toDashboardPercent,
} from '../../common/utils/dashboard-preview.utils';

export type FinanceDashboardScorecardInput = {
  cashOnHand: number;
  monthlyBurn: number;
  overdueReceivable: number;
  budgetVariancePct: number;
  currentRatio: number;
};

export type FinanceDashboardScorecard = {
  audience: Extract<DashboardAudience, 'FINANCE'>;
  window: Extract<DashboardTimeWindow, 'THIS_MONTH'>;
  overallSignal: DashboardSignalTone;
  runwayMonths: number;
  overdueReceivablePctOfCash: number;
  currentRatio: number;
  budgetVariancePct: number;
  liquiditySignal: DashboardSignalTone;
  receivablesSignal: DashboardSignalTone;
  budgetSignal: DashboardSignalTone;
  focusArea: string;
  summary: string;
};

@Injectable()
export class FinanceDashboardScorecardService {
  previewScorecard(input: FinanceDashboardScorecardInput): FinanceDashboardScorecard {
    assertDashboardMetricMin('Cash on hand', input.cashOnHand);
    assertDashboardMetricMin('Monthly burn', input.monthlyBurn, 0.01);
    assertDashboardMetricMin('Overdue receivable', input.overdueReceivable);
    assertDashboardMetricRange('Budget variance percentage', input.budgetVariancePct, -100, 100);
    assertDashboardMetricRange('Current ratio', input.currentRatio, 0, 10);

    const runwayMonths = roundDashboardMetric(input.cashOnHand / input.monthlyBurn);
    const overdueReceivablePctOfCash = toDashboardPercent(
      input.overdueReceivable,
      input.cashOnHand || 1,
    );

    const runwaySignal =
      runwayMonths < 3
        ? 'CRITICAL'
        : runwayMonths < 6
          ? 'AT_RISK'
          : runwayMonths < 9
            ? 'WATCH'
            : 'HEALTHY';
    const liquiditySignal =
      input.currentRatio < 1
        ? 'CRITICAL'
        : input.currentRatio < 1.2
          ? 'AT_RISK'
          : input.currentRatio < 1.5
            ? 'WATCH'
            : 'HEALTHY';
    const receivablesSignal =
      overdueReceivablePctOfCash > 100
        ? 'CRITICAL'
        : overdueReceivablePctOfCash > 60
          ? 'AT_RISK'
          : overdueReceivablePctOfCash > 30
            ? 'WATCH'
            : 'HEALTHY';
    const budgetSignal =
      Math.abs(input.budgetVariancePct) > 15
        ? 'AT_RISK'
        : Math.abs(input.budgetVariancePct) > 8
          ? 'WATCH'
          : 'HEALTHY';

    const overallSignal = selectDashboardSignal(
      runwaySignal,
      liquiditySignal,
      receivablesSignal,
      budgetSignal,
    );
    const focusArea = this.resolveFocusArea({
      runwaySignal,
      liquiditySignal,
      receivablesSignal,
      budgetSignal,
    });

    return {
      audience: 'FINANCE',
      window: 'THIS_MONTH',
      overallSignal,
      runwayMonths,
      overdueReceivablePctOfCash,
      currentRatio: roundDashboardMetric(input.currentRatio),
      budgetVariancePct: roundDashboardMetric(input.budgetVariancePct),
      liquiditySignal,
      receivablesSignal,
      budgetSignal,
      focusArea,
      summary: this.buildSummary(overallSignal, focusArea),
    };
  }

  private resolveFocusArea(input: {
    runwaySignal: DashboardSignalTone;
    liquiditySignal: DashboardSignalTone;
    receivablesSignal: DashboardSignalTone;
    budgetSignal: DashboardSignalTone;
  }): string {
    if (input.runwaySignal === 'CRITICAL' || input.runwaySignal === 'AT_RISK') {
      return 'Cash runway';
    }
    if (input.liquiditySignal === 'CRITICAL' || input.liquiditySignal === 'AT_RISK') {
      return 'Liquidity coverage';
    }
    if (input.receivablesSignal === 'CRITICAL' || input.receivablesSignal === 'AT_RISK') {
      return 'Overdue receivables';
    }
    if (input.budgetSignal !== 'HEALTHY') {
      return 'Budget discipline';
    }

    return 'Finance control baseline';
  }

  private buildSummary(signal: DashboardSignalTone, focusArea: string): string {
    switch (signal) {
      case 'CRITICAL':
        return `${focusArea} requires immediate finance intervention before close discipline weakens further.`;
      case 'AT_RISK':
        return `${focusArea} is pressuring finance resilience and should move to the weekly review lane.`;
      case 'WATCH':
        return `${focusArea} is still controllable but needs closer monitoring through the current month.`;
      case 'HEALTHY':
        return 'Runway, liquidity, receivables, and budget variance remain within controllable finance thresholds.';
    }
  }
}
