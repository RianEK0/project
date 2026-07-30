import { describe, expect, it } from 'vitest';

import { UnitConversionService } from './unit-conversion.service';

describe('UnitConversionService', () => {
  const service = new UnitConversionService();

  it('converts compatible units with deterministic precision', () => {
    expect(
      service.convert('2.5', {
        fromDimension: 'EACH',
        toDimension: 'EACH',
        multiplier: '24',
        divisor: '1',
        precision: 2,
      }),
    ).toBe('60.00');
  });

  it('supports half-even rounding for packaging conversions', () => {
    expect(
      service.convert('1', {
        fromDimension: 'MASS',
        toDimension: 'MASS',
        multiplier: '1',
        divisor: '8',
        precision: 2,
        roundingMode: 'HALF_EVEN',
      }),
    ).toBe('0.12');
  });

  it('rejects conversions across different dimensions', () => {
    expect(() =>
      service.convert('5', {
        fromDimension: 'EACH',
        toDimension: 'MASS',
        multiplier: '1',
      }),
    ).toThrow('Unit conversion from EACH to MASS is not allowed.');
  });
});
