import { HttpStatus } from '@nestjs/common';
import { type AnalyticsWorkspaceCapabilityStatus } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

export function assertAnalyticsWorkspacePercent(label: string, value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new AppException(
      ERROR_CODES.ANALYTICS_WORKSPACE_INPUT_INVALID,
      `${label} must be between 0 and 100.`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export function assertAnalyticsWorkspaceMin(label: string, value: number, min = 0): void {
  if (!Number.isFinite(value) || value < min) {
    throw new AppException(
      ERROR_CODES.ANALYTICS_WORKSPACE_INPUT_INVALID,
      `${label} must be greater than or equal to ${min}.`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export function roundAnalyticsWorkspaceMetric(value: number, precision = 2): number {
  const scale = 10 ** precision;

  return Math.round((value + Number.EPSILON) * scale) / scale;
}

export function averageAnalyticsWorkspaceReadiness(values: number[], precision = 2): number {
  if (values.length === 0) {
    return 0;
  }

  return roundAnalyticsWorkspaceMetric(
    values.reduce((sum, value) => sum + value, 0) / values.length,
    precision,
  );
}

export function resolveAnalyticsWorkspaceStatus(input: {
  readinessPct: number;
  blockers?: boolean[];
}): AnalyticsWorkspaceCapabilityStatus {
  if (input.blockers?.some(Boolean)) {
    return 'BLOCKED';
  }
  if (input.readinessPct >= 88) {
    return 'READY';
  }
  if (input.readinessPct >= 65) {
    return 'FOUNDATION';
  }
  if (input.readinessPct >= 35) {
    return 'LIMITED';
  }

  return 'BLOCKED';
}

export function countEnabledAnalyticsCapabilities(
  readinessValues: number[],
  threshold = 55,
): number {
  return readinessValues.filter((value) => value >= threshold).length;
}
