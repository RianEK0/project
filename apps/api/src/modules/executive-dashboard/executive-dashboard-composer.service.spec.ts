import { describe, expect, it } from 'vitest';

import { ExecutiveDashboardComposerService } from './executive-dashboard-composer.service';

describe('ExecutiveDashboardComposerService', () => {
  const service = new ExecutiveDashboardComposerService();

  it('keeps a balanced executive portfolio healthy', () => {
    const preview = service.previewPortfolio({
      revenueGrowthPct: 12,
      cashRunwayMonths: 10,
      orderFillRatePct: 96,
      inventoryAtRiskPct: 4,
      attendancePct: 97,
      capacityUtilizationPct: 81,
    });

    expect(preview.overallSignal).toBe('HEALTHY');
    expect(preview.focusArea).toBe('Enterprise performance balanced');
  });

  it('escalates low runway and stressed inventory into an executive alert', () => {
    const preview = service.previewPortfolio({
      revenueGrowthPct: 3,
      cashRunwayMonths: 2.5,
      orderFillRatePct: 89,
      inventoryAtRiskPct: 19,
      attendancePct: 94,
      capacityUtilizationPct: 96,
    });

    expect(preview.overallSignal).toBe('CRITICAL');
    expect(preview.focusArea).toBe('Cash Runway');
  });
});
