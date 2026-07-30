import { describe, expect, it } from 'vitest';

import { BiBuilderService } from './bi-builder.service';

describe('BiBuilderService', () => {
  const service = new BiBuilderService();

  it('builds a self-serve BI dashboard preview from dropped widgets', () => {
    const preview = service.preview({
      title: 'Executive Pulse',
      layoutMode: 'GRID',
      timeWindow: 'THIS_MONTH',
      widgets: [
        { id: 'w1', type: 'CHART', domain: 'sales', metric: 'revenue_trend' },
        { id: 'w2', type: 'GAUGE', domain: 'finance', metric: 'cash_runway' },
        { id: 'w3', type: 'FORECAST', domain: 'purchase', metric: 'lead_time_projection' },
      ],
    });

    expect(preview.status).toBe('READY');
    expect(preview.widgetCount).toBe(3);
    expect(preview.forecastAnchorDate).toBe('2026-08-31');
  });

  it('rejects an empty BI canvas', () => {
    expect(() =>
      service.preview({
        title: 'Empty Canvas',
        widgets: [],
      }),
    ).toThrow();
  });
});
