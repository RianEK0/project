import { describe, expect, it } from 'vitest';

import { MobileWarehouseUiService } from './mobile-warehouse-ui.service';

describe('MobileWarehouseUiService', () => {
  const service = new MobileWarehouseUiService();

  it('reports ready when touch execution is stable across tablet and handheld surfaces', () => {
    const preview = service.previewSurface({
      scanSuccessRatePct: 97.5,
      averagePickSeconds: 52,
      deviceBatteryPct: 84,
      gpsCoveragePct: 91,
      pushAcknowledgeMinutes: 4,
      tabletUtilizationPct: 78,
    });

    expect(preview.status).toBe('READY');
  });

  it('reports blocked when scan reliability or battery is too weak', () => {
    const preview = service.previewSurface({
      scanSuccessRatePct: 80,
      averagePickSeconds: 64,
      deviceBatteryPct: 18,
      gpsCoveragePct: 88,
      pushAcknowledgeMinutes: 5,
      tabletUtilizationPct: 72,
    });

    expect(preview.status).toBe('BLOCKED');
  });
});
