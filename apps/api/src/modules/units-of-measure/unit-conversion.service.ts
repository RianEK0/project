import { HttpStatus, Injectable } from '@nestjs/common';
import type { RoundingMode, UomDimension } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type NumericLike = number | string;

export type UnitConversionRule = {
  fromDimension: UomDimension;
  toDimension: UomDimension;
  multiplier: NumericLike;
  divisor?: NumericLike;
  precision?: number;
  roundingMode?: RoundingMode;
};

@Injectable()
export class UnitConversionService {
  convert(quantity: NumericLike, rule: UnitConversionRule): string {
    this.assertSameDimension(rule.fromDimension, rule.toDimension);

    const normalizedQuantity = this.parseNumeric(quantity, 'quantity');
    const multiplier = this.parseNumeric(rule.multiplier, 'multiplier');
    const divisor = this.parseNumeric(rule.divisor ?? 1, 'divisor');

    if (divisor === 0) {
      throw new AppException(
        ERROR_CODES.INVENTORY_QUANTITY_INVALID,
        'Unit conversion divisor must be greater than zero.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const precision = rule.precision ?? 4;
    const roundingMode = rule.roundingMode ?? 'HALF_UP';
    const converted = (normalizedQuantity * multiplier) / divisor;

    return this.round(converted, precision, roundingMode).toFixed(precision);
  }

  assertSameDimension(fromDimension: UomDimension, toDimension: UomDimension): void {
    if (fromDimension !== toDimension) {
      throw new AppException(
        ERROR_CODES.UOM_DIMENSION_MISMATCH,
        `Unit conversion from ${fromDimension} to ${toDimension} is not allowed.`,
        HttpStatus.CONFLICT,
      );
    }
  }

  private parseNumeric(value: NumericLike, label: string): number {
    const parsed = typeof value === 'number' ? value : Number.parseFloat(value);

    if (!Number.isFinite(parsed)) {
      throw new AppException(
        ERROR_CODES.INVENTORY_QUANTITY_INVALID,
        `Invalid numeric ${label} supplied for unit conversion.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return parsed;
  }

  private round(value: number, precision: number, roundingMode: RoundingMode): number {
    const factor = 10 ** precision;
    const scaled = value * factor;
    const sign = Math.sign(scaled) || 1;
    const absolute = Math.abs(scaled);
    const floor = Math.floor(absolute);
    const fraction = absolute - floor;
    const isHalf = Math.abs(fraction - 0.5) < Number.EPSILON * 10;

    switch (roundingMode) {
      case 'UP':
        return (sign * Math.ceil(absolute)) / factor;
      case 'DOWN':
        return (sign * Math.floor(absolute)) / factor;
      case 'HALF_DOWN':
        return (sign * (isHalf ? floor : Math.round(absolute))) / factor;
      case 'HALF_EVEN': {
        if (!isHalf) {
          return (sign * Math.round(absolute)) / factor;
        }

        const nearestEven = floor % 2 === 0 ? floor : floor + 1;

        return (sign * nearestEven) / factor;
      }
      case 'HALF_UP':
      default:
        return (sign * Math.round(absolute)) / factor;
    }
  }
}
