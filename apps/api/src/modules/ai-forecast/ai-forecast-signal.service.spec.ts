import { describe, expect, it } from 'vitest';

import { AiForecastSignalService } from './ai-forecast-signal.service';

describe('AiForecastSignalService', () => {
  const service = new AiForecastSignalService();

  it('projects an upward trend into the selected horizon', () => {
    expect(
      service.previewForecast({
        metric: 'Open purchase exposure',
        horizon: '30_DAYS',
        history: [120, 130, 150, 165],
      }),
    ).toMatchObject({
      baseline: 165,
      trend: 'UP',
      projectedValue: 195,
    });
  });

  it('captures downward trends without returning negative projections', () => {
    expect(
      service.previewForecast({
        metric: 'Backorder units',
        horizon: '90_DAYS',
        history: [60, 45, 32, 20],
      }),
    ).toMatchObject({
      trend: 'DOWN',
      projectedValue: 0,
    });
  });

  it('requires enough history to produce a forecast preview', () => {
    expect(() =>
      service.previewForecast({
        metric: 'Cash position',
        horizon: '7_DAYS',
        history: [100, 110],
      }),
    ).toThrowError(/at least three history points/i);
  });
});
