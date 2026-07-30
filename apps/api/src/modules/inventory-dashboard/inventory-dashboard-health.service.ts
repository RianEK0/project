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

export type InventoryDashboardHealthInput = {
  onHandValue: number;
  blockedValue: number;
  agingStockValue: number;
  reorderAlerts: number;
  stockAccuracyPct: number;
};

export type InventoryDashboardHealth = {
  audience: Extract<DashboardAudience, 'INVENTORY'>;
  window: Extract<DashboardTimeWindow, 'THIS_MONTH'>;
  overallSignal: DashboardSignalTone;
  blockedPct: number;
  agingPct: number;
  stockAccuracyPct: number;
  reorderAlerts: number;
  focusArea: string;
  summary: string;
};

@Injectable()
export class InventoryDashboardHealthService {
  previewHealth(input: InventoryDashboardHealthInput): InventoryDashboardHealth {
    assertDashboardMetricMin('On-hand value', input.onHandValue);
    assertDashboardMetricMin('Blocked value', input.blockedValue);
    assertDashboardMetricMin('Aging stock value', input.agingStockValue);
    assertDashboardMetricMin('Reorder alerts', input.reorderAlerts);
    assertDashboardMetricRange('Stock accuracy percentage', input.stockAccuracyPct, 0, 100);

    if (input.onHandValue === 0 && (input.blockedValue > 0 || input.agingStockValue > 0)) {
      throw new AppException(
        ERROR_CODES.DASHBOARD_INPUT_INVALID,
        'On-hand value must be positive when blocked or aging value exists.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const blockedPct = toDashboardPercent(input.blockedValue, input.onHandValue || 1);
    const agingPct = toDashboardPercent(input.agingStockValue, input.onHandValue || 1);

    const blockedTone =
      blockedPct > 20
        ? 'CRITICAL'
        : blockedPct > 12
          ? 'AT_RISK'
          : blockedPct > 5
            ? 'WATCH'
            : 'HEALTHY';
    const agingTone =
      agingPct > 25 ? 'CRITICAL' : agingPct > 15 ? 'AT_RISK' : agingPct > 8 ? 'WATCH' : 'HEALTHY';
    const accuracyTone =
      input.stockAccuracyPct < 94 ? 'AT_RISK' : input.stockAccuracyPct < 97 ? 'WATCH' : 'HEALTHY';
    const reorderTone =
      input.reorderAlerts > 20 ? 'AT_RISK' : input.reorderAlerts > 8 ? 'WATCH' : 'HEALTHY';

    const overallSignal = selectDashboardSignal(blockedTone, agingTone, accuracyTone, reorderTone);
    const focusArea = this.resolveFocusArea({ blockedTone, agingTone, accuracyTone, reorderTone });

    return {
      audience: 'INVENTORY',
      window: 'THIS_MONTH',
      overallSignal,
      blockedPct: roundDashboardMetric(blockedPct),
      agingPct: roundDashboardMetric(agingPct),
      stockAccuracyPct: roundDashboardMetric(input.stockAccuracyPct),
      reorderAlerts: roundDashboardMetric(input.reorderAlerts, 0),
      focusArea,
      summary: this.buildSummary(overallSignal, focusArea),
    };
  }

  private resolveFocusArea(input: {
    blockedTone: DashboardSignalTone;
    agingTone: DashboardSignalTone;
    accuracyTone: DashboardSignalTone;
    reorderTone: DashboardSignalTone;
  }): string {
    if (input.blockedTone === 'CRITICAL' || input.blockedTone === 'AT_RISK') {
      return 'Blocked stock';
    }
    if (input.agingTone === 'CRITICAL' || input.agingTone === 'AT_RISK') {
      return 'Aging stock';
    }
    if (input.accuracyTone === 'AT_RISK') {
      return 'Stock accuracy';
    }
    if (input.reorderTone !== 'HEALTHY') {
      return 'Reorder exposure';
    }

    return 'Inventory health baseline';
  }

  private buildSummary(signal: DashboardSignalTone, focusArea: string): string {
    switch (signal) {
      case 'CRITICAL':
        return `${focusArea} is constraining inventory liquidity and needs immediate clean-up.`;
      case 'AT_RISK':
        return `${focusArea} is degrading inventory performance and should be addressed in the current cycle.`;
      case 'WATCH':
        return `${focusArea} should stay visible while the broader stock position remains controllable.`;
      case 'HEALTHY':
        return 'Blocked, aging, accuracy, and replenishment signals remain within controllable inventory thresholds.';
    }
  }
}
