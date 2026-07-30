import { HttpStatus, Injectable } from '@nestjs/common';
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
import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

export type WarehouseDashboardControlTowerInput = {
  openTasks: number;
  overdueTasks: number;
  dispatchReady: number;
  receiptBacklog: number;
  pickingAccuracyPct: number;
};

export type WarehouseDashboardControlTower = {
  audience: Extract<DashboardAudience, 'WAREHOUSE'>;
  window: Extract<DashboardTimeWindow, 'TODAY'>;
  overallSignal: DashboardSignalTone;
  overdueRate: number;
  flowPressure: 'LOW' | 'MEDIUM' | 'HIGH';
  dispatchReady: number;
  receiptBacklog: number;
  pickingAccuracyPct: number;
  focusArea: string;
  summary: string;
};

@Injectable()
export class WarehouseDashboardControlTowerService {
  previewTower(input: WarehouseDashboardControlTowerInput): WarehouseDashboardControlTower {
    assertDashboardMetricMin('Open tasks', input.openTasks);
    assertDashboardMetricMin('Overdue tasks', input.overdueTasks);
    assertDashboardMetricMin('Dispatch ready count', input.dispatchReady);
    assertDashboardMetricMin('Receipt backlog', input.receiptBacklog);
    assertDashboardMetricRange('Picking accuracy percentage', input.pickingAccuracyPct, 0, 100);

    if (input.overdueTasks > input.openTasks) {
      throw new AppException(
        ERROR_CODES.DASHBOARD_INPUT_INVALID,
        'Overdue tasks cannot exceed total open tasks.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const overdueRate = toDashboardPercent(input.overdueTasks, input.openTasks || 1);
    const overdueTone =
      overdueRate > 25
        ? 'CRITICAL'
        : overdueRate > 15
          ? 'AT_RISK'
          : overdueRate > 7
            ? 'WATCH'
            : 'HEALTHY';
    const backlogTone =
      input.receiptBacklog > 25 ? 'AT_RISK' : input.receiptBacklog > 10 ? 'WATCH' : 'HEALTHY';
    const accuracyTone =
      input.pickingAccuracyPct < 94
        ? 'AT_RISK'
        : input.pickingAccuracyPct < 97
          ? 'WATCH'
          : 'HEALTHY';
    const dispatchTone =
      input.dispatchReady < 8 && input.openTasks > 20
        ? 'AT_RISK'
        : input.dispatchReady < 12 && input.openTasks > 12
          ? 'WATCH'
          : 'HEALTHY';

    const overallSignal = selectDashboardSignal(
      overdueTone,
      backlogTone,
      accuracyTone,
      dispatchTone,
    );
    const focusArea = this.resolveFocusArea({
      overdueTone,
      backlogTone,
      accuracyTone,
      dispatchTone,
    });

    return {
      audience: 'WAREHOUSE',
      window: 'TODAY',
      overallSignal,
      overdueRate: roundDashboardMetric(overdueRate),
      flowPressure:
        overdueRate > 15 || input.receiptBacklog > 12
          ? 'HIGH'
          : input.openTasks > 12
            ? 'MEDIUM'
            : 'LOW',
      dispatchReady: roundDashboardMetric(input.dispatchReady, 0),
      receiptBacklog: roundDashboardMetric(input.receiptBacklog, 0),
      pickingAccuracyPct: roundDashboardMetric(input.pickingAccuracyPct),
      focusArea,
      summary: this.buildSummary(overallSignal, focusArea),
    };
  }

  private resolveFocusArea(input: {
    overdueTone: DashboardSignalTone;
    backlogTone: DashboardSignalTone;
    accuracyTone: DashboardSignalTone;
    dispatchTone: DashboardSignalTone;
  }): string {
    if (input.overdueTone === 'CRITICAL' || input.overdueTone === 'AT_RISK') {
      return 'Task overdue pressure';
    }
    if (input.backlogTone === 'AT_RISK') {
      return 'Receipt backlog';
    }
    if (input.accuracyTone === 'AT_RISK') {
      return 'Picking accuracy';
    }
    if (input.dispatchTone !== 'HEALTHY') {
      return 'Dispatch readiness';
    }

    return 'Warehouse control baseline';
  }

  private buildSummary(signal: DashboardSignalTone, focusArea: string): string {
    switch (signal) {
      case 'CRITICAL':
        return `${focusArea} is breaking warehouse flow and needs immediate control-tower intervention.`;
      case 'AT_RISK':
        return `${focusArea} is weakening daily flow and should be stabilized this shift.`;
      case 'WATCH':
        return `${focusArea} should remain visible as throughput starts to tighten.`;
      case 'HEALTHY':
        return 'Task aging, receipt flow, dispatch readiness, and picking accuracy remain within control.';
    }
  }
}
