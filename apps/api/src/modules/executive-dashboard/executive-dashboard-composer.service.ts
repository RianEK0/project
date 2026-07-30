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
} from '../../common/utils/dashboard-preview.utils';

export type ExecutiveDashboardPreviewInput = {
  revenueGrowthPct: number;
  cashRunwayMonths: number;
  orderFillRatePct: number;
  inventoryAtRiskPct: number;
  attendancePct: number;
  capacityUtilizationPct: number;
};

export type ExecutiveDashboardPreview = {
  audience: Extract<DashboardAudience, 'EXECUTIVE'>;
  window: Extract<DashboardTimeWindow, 'THIS_MONTH'>;
  overallSignal: DashboardSignalTone;
  focusArea: string;
  summary: string;
  scorecards: Array<{
    id: string;
    label: string;
    value: number;
    unit: 'PCT' | 'MONTHS';
    tone: DashboardSignalTone;
  }>;
};

@Injectable()
export class ExecutiveDashboardComposerService {
  previewPortfolio(input: ExecutiveDashboardPreviewInput): ExecutiveDashboardPreview {
    assertDashboardMetricRange('Revenue growth percentage', input.revenueGrowthPct, -100, 300);
    assertDashboardMetricMin('Cash runway months', input.cashRunwayMonths);
    assertDashboardMetricRange('Order fill rate percentage', input.orderFillRatePct, 0, 100);
    assertDashboardMetricRange('Inventory at risk percentage', input.inventoryAtRiskPct, 0, 100);
    assertDashboardMetricRange('Attendance percentage', input.attendancePct, 0, 100);
    assertDashboardMetricRange(
      'Capacity utilization percentage',
      input.capacityUtilizationPct,
      0,
      150,
    );

    const revenueTone =
      input.revenueGrowthPct < 0 ? 'AT_RISK' : input.revenueGrowthPct < 5 ? 'WATCH' : 'HEALTHY';
    const cashTone =
      input.cashRunwayMonths < 3
        ? 'CRITICAL'
        : input.cashRunwayMonths < 6
          ? 'AT_RISK'
          : input.cashRunwayMonths < 9
            ? 'WATCH'
            : 'HEALTHY';
    const fillTone =
      input.orderFillRatePct < 85 ? 'AT_RISK' : input.orderFillRatePct < 93 ? 'WATCH' : 'HEALTHY';
    const inventoryTone =
      input.inventoryAtRiskPct > 18
        ? 'CRITICAL'
        : input.inventoryAtRiskPct > 10
          ? 'AT_RISK'
          : input.inventoryAtRiskPct > 5
            ? 'WATCH'
            : 'HEALTHY';
    const attendanceTone =
      input.attendancePct < 90 ? 'AT_RISK' : input.attendancePct < 95 ? 'WATCH' : 'HEALTHY';
    const capacityTone =
      input.capacityUtilizationPct > 100
        ? 'CRITICAL'
        : input.capacityUtilizationPct > 92
          ? 'AT_RISK'
          : input.capacityUtilizationPct > 85
            ? 'WATCH'
            : 'HEALTHY';

    const scorecards: ExecutiveDashboardPreview['scorecards'] = [
      {
        id: 'revenue-growth',
        label: 'Revenue Growth',
        value: roundDashboardMetric(input.revenueGrowthPct),
        unit: 'PCT',
        tone: revenueTone,
      },
      {
        id: 'cash-runway',
        label: 'Cash Runway',
        value: roundDashboardMetric(input.cashRunwayMonths),
        unit: 'MONTHS',
        tone: cashTone,
      },
      {
        id: 'order-fill-rate',
        label: 'Order Fill Rate',
        value: roundDashboardMetric(input.orderFillRatePct),
        unit: 'PCT',
        tone: fillTone,
      },
      {
        id: 'inventory-at-risk',
        label: 'Inventory At Risk',
        value: roundDashboardMetric(input.inventoryAtRiskPct),
        unit: 'PCT',
        tone: inventoryTone,
      },
      {
        id: 'attendance-rate',
        label: 'Attendance',
        value: roundDashboardMetric(input.attendancePct),
        unit: 'PCT',
        tone: attendanceTone,
      },
      {
        id: 'capacity-utilization',
        label: 'Capacity Utilization',
        value: roundDashboardMetric(input.capacityUtilizationPct),
        unit: 'PCT',
        tone: capacityTone,
      },
    ];

    const overallSignal = selectDashboardSignal(
      revenueTone,
      cashTone,
      fillTone,
      inventoryTone,
      attendanceTone,
      capacityTone,
    );
    const focusArea = this.resolveFocusArea(scorecards);

    return {
      audience: 'EXECUTIVE',
      window: 'THIS_MONTH',
      overallSignal,
      focusArea,
      summary: this.buildSummary(overallSignal, focusArea),
      scorecards,
    };
  }

  private resolveFocusArea(scorecards: ExecutiveDashboardPreview['scorecards']): string {
    const criticalCard = scorecards.find((card) => card.tone === 'CRITICAL');

    if (criticalCard) {
      return criticalCard.label;
    }

    const atRiskCard = scorecards.find((card) => card.tone === 'AT_RISK');

    if (atRiskCard) {
      return atRiskCard.label;
    }

    const watchCard = scorecards.find((card) => card.tone === 'WATCH');

    return watchCard?.label ?? 'Enterprise performance balanced';
  }

  private buildSummary(overallSignal: DashboardSignalTone, focusArea: string): string {
    switch (overallSignal) {
      case 'CRITICAL':
        return `Executive attention should center on ${focusArea} before the current operating month closes.`;
      case 'AT_RISK':
        return `${focusArea} is starting to constrain enterprise execution and needs coordinated recovery.`;
      case 'WATCH':
        return `${focusArea} should be watched closely while the rest of the operating portfolio stays stable.`;
      case 'HEALTHY':
        return 'Growth, cash, fulfillment, workforce, and capacity signals are currently balanced.';
    }
  }
}
