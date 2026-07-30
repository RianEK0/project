import { HttpStatus } from '@nestjs/common';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

export function assertMobileMetricRange(
  label: string,
  value: number,
  min: number,
  max: number,
): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new AppException(
      ERROR_CODES.MOBILE_INPUT_INVALID,
      `${label} must be between ${min} and ${max}.`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export function assertMobileMetricMin(label: string, value: number, min = 0): void {
  if (!Number.isFinite(value) || value < min) {
    throw new AppException(
      ERROR_CODES.MOBILE_INPUT_INVALID,
      `${label} must be greater than or equal to ${min}.`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export function roundMobileMetric(value: number, precision = 2): number {
  const scale = 10 ** precision;

  return Math.round((value + Number.EPSILON) * scale) / scale;
}

export function toMobilePercent(numerator: number, denominator: number, precision = 2): number {
  if (denominator === 0) {
    return 0;
  }

  return roundMobileMetric((numerator / denominator) * 100, precision);
}
