import { describe, expect, it } from 'vitest';

import { FinanceDashboardScorecardService } from './finance-dashboard-scorecard.service';

describe('FinanceDashboardScorecardService', () => {
  const service = new FinanceDashboardScorecardService();

  it('keeps the finance scorecard healthy when runway and liquidity are strong', () => {
    const scorecard = service.previewScorecard({
      cashOnHand: 2_400_000,
      monthlyBurn: 220_000,
      overdueReceivable: 180_000,
      budgetVariancePct: 4,
      currentRatio: 1.9,
    });

    expect(scorecard.overallSignal).toBe('HEALTHY');
    expect(scorecard.focusArea).toBe('Finance control baseline');
  });

  it('escalates short runway and weak liquidity into a finance alert', () => {
    const scorecard = service.previewScorecard({
      cashOnHand: 240_000,
      monthlyBurn: 120_000,
      overdueReceivable: 180_000,
      budgetVariancePct: 18,
      currentRatio: 0.95,
    });

    expect(scorecard.overallSignal).toBe('CRITICAL');
    expect(scorecard.focusArea).toBe('Cash runway');
  });
});
