import { describe, expect, it } from 'vitest';

import { TaxEngineService } from './tax-engine.service';

describe('TaxEngineService', () => {
  const service = new TaxEngineService();

  it('calculates exclusive, inclusive, and exempt tax correctly', () => {
    const result = service.evaluate([
      { lineId: 'exclusive', taxableAmount: 100, ratePct: 11, mode: 'EXCLUSIVE' },
      { lineId: 'inclusive', taxableAmount: 110, ratePct: 10, mode: 'INCLUSIVE' },
      { lineId: 'exempt', taxableAmount: 80, ratePct: 0, mode: 'EXEMPT' },
    ]);

    expect(result.lines[0]?.grossAmount).toBe(111);
    expect(result.lines[1]?.netAmount).toBe(100);
    expect(result.lines[2]?.taxAmount).toBe(0);
  });

  it('requires non-negative amount and rate', () => {
    expect(() =>
      service.evaluate([{ lineId: 'broken', taxableAmount: -1, ratePct: 10, mode: 'EXCLUSIVE' }]),
    ).toThrowError(/requires non-negative amount and rate/i);
  });
});
