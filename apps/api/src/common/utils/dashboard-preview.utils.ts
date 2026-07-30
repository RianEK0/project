import { HttpStatus } from '@nestjs/common';
import { type DashboardSignalTone } from '@nova/shared-types';

import { ERROR_CODES } from '../constants/error-codes';
import { AppException } from '../exceptions/app.exception';

const dashboardSignalSeverity: Record<DashboardSignalTone, number> = {
  HEALTHY: 0,
  WATCH: 1,
  AT_RISK: 2,
  CRITICAL: 3,
};

export function assertDashboardMetricMin(label: string, value: number, min = 0): void {
  if (!Number.isFinite(value) || value < min) {
    throw new AppException(
      ERROR_CODES.DASHBOARD_INPUT_INVALID,
      `${label} must be greater than or equal to ${min}.`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export function assertDashboardMetricRange(
  label: string,
  value: number,
  min: number,
  max: number,
): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new AppException(
      ERROR_CODES.DASHBOARD_INPUT_INVALID,
      `${label} must be between ${min} and ${max}.`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export function roundDashboardMetric(value: number, precision = 2): number {
  const scale = 10 ** precision;

  return Math.round((value + Number.EPSILON) * scale) / scale;
}

export function toDashboardPercent(numerator: number, denominator: number, precision = 2): number {
  if (denominator === 0) {
    return 0;
  }

  return roundDashboardMetric((numerator / denominator) * 100, precision);
}

export function selectDashboardSignal(...tones: DashboardSignalTone[]): DashboardSignalTone {
  return tones.reduce<DashboardSignalTone>((worst, tone) => {
    return dashboardSignalSeverity[tone] > dashboardSignalSeverity[worst] ? tone : worst;
  }, 'HEALTHY');
}
