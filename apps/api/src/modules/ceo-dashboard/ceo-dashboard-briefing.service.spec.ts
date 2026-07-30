import { describe, expect, it } from 'vitest';

import { CeoDashboardBriefingService } from './ceo-dashboard-briefing.service';

describe('CeoDashboardBriefingService', () => {
  const service = new CeoDashboardBriefingService();

  it('keeps a balanced board briefing healthy', () => {
    const briefing = service.previewBriefing({
      netRevenueRunRate: 1_800_000,
      pipelineCoverageRatio: 2.4,
      liquidityRatio: 1.8,
      strategicInitiativesOnTrackPct: 88,
      blockedEscalations: 1,
    });

    expect(briefing.summarySignal).toBe('HEALTHY');
    expect(briefing.topFocus).toBe('Portfolio momentum');
  });

  it('prioritizes liquidity when cash resilience drops', () => {
    const briefing = service.previewBriefing({
      netRevenueRunRate: 1_100_000,
      pipelineCoverageRatio: 1.9,
      liquidityRatio: 0.9,
      strategicInitiativesOnTrackPct: 78,
      blockedEscalations: 6,
    });

    expect(briefing.summarySignal).toBe('CRITICAL');
    expect(briefing.topFocus).toBe('Liquidity and cash protection');
  });
});
