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

export type ManufacturingDashboardThroughputInput = {
  workCenter: string;
  availableHours: number;
  plannedHours: number;
  overtimeBufferHours: number;
  firstPassYieldPct: number;
  shortageOrders: number;
};

export type ManufacturingDashboardThroughput = {
  audience: Extract<DashboardAudience, 'MANUFACTURING'>;
  window: Extract<DashboardTimeWindow, 'THIS_WEEK'>;
  workCenter: string;
  overallSignal: DashboardSignalTone;
  effectiveCapacityHours: number;
  utilizationPct: number;
  firstPassYieldPct: number;
  shortageOrders: number;
  gapHours: number;
  focusArea: string;
  summary: string;
};

@Injectable()
export class ManufacturingDashboardThroughputService {
  previewThroughput(
    input: ManufacturingDashboardThroughputInput,
  ): ManufacturingDashboardThroughput {
    assertDashboardMetricMin('Available hours', input.availableHours, 0.01);
    assertDashboardMetricMin('Planned hours', input.plannedHours);
    assertDashboardMetricMin('Overtime buffer hours', input.overtimeBufferHours);
    assertDashboardMetricRange('First pass yield percentage', input.firstPassYieldPct, 0, 100);
    assertDashboardMetricMin('Shortage orders', input.shortageOrders);

    const effectiveCapacityHours = input.availableHours + input.overtimeBufferHours;
    const utilizationPct = roundDashboardMetric(
      (input.plannedHours / effectiveCapacityHours) * 100,
    );
    const gapHours = roundDashboardMetric(effectiveCapacityHours - input.plannedHours);

    const utilizationTone =
      utilizationPct > 100
        ? 'CRITICAL'
        : utilizationPct > 92
          ? 'AT_RISK'
          : utilizationPct < 60
            ? 'WATCH'
            : 'HEALTHY';
    const yieldTone =
      input.firstPassYieldPct < 92 ? 'AT_RISK' : input.firstPassYieldPct < 96 ? 'WATCH' : 'HEALTHY';
    const shortageTone =
      input.shortageOrders > 15 ? 'AT_RISK' : input.shortageOrders > 5 ? 'WATCH' : 'HEALTHY';

    const overallSignal = selectDashboardSignal(utilizationTone, yieldTone, shortageTone);
    const focusArea = this.resolveFocusArea({ utilizationTone, yieldTone, shortageTone });

    return {
      audience: 'MANUFACTURING',
      window: 'THIS_WEEK',
      workCenter: input.workCenter,
      overallSignal,
      effectiveCapacityHours: roundDashboardMetric(effectiveCapacityHours),
      utilizationPct,
      firstPassYieldPct: roundDashboardMetric(input.firstPassYieldPct),
      shortageOrders: roundDashboardMetric(input.shortageOrders, 0),
      gapHours,
      focusArea,
      summary: this.buildSummary(overallSignal, focusArea),
    };
  }

  private resolveFocusArea(input: {
    utilizationTone: DashboardSignalTone;
    yieldTone: DashboardSignalTone;
    shortageTone: DashboardSignalTone;
  }): string {
    if (input.utilizationTone === 'CRITICAL' || input.utilizationTone === 'AT_RISK') {
      return 'Capacity utilization';
    }
    if (input.yieldTone === 'AT_RISK') {
      return 'First-pass yield';
    }
    if (input.shortageTone !== 'HEALTHY') {
      return 'Material shortages';
    }

    return 'Manufacturing throughput baseline';
  }

  private buildSummary(signal: DashboardSignalTone, focusArea: string): string {
    switch (signal) {
      case 'CRITICAL':
        return `${focusArea} is constraining weekly throughput and needs immediate recovery action.`;
      case 'AT_RISK':
        return `${focusArea} is pressuring production performance and should be addressed in the next planning cycle.`;
      case 'WATCH':
        return `${focusArea} should stay visible while the rest of the shop-floor signal remains manageable.`;
      case 'HEALTHY':
        return 'Capacity, yield, and shortage exposure remain within expected manufacturing thresholds.';
    }
  }
}
