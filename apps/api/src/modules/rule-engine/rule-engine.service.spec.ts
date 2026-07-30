import { describe, expect, it } from 'vitest';

import { RuleEngineService } from './rule-engine.service';

describe('RuleEngineService', () => {
  const service = new RuleEngineService();

  it('builds a stock threshold rule preview', () => {
    const preview = service.preview({
      ruleName: 'Low Stock Auto PR',
      factType: 'STOCK_ON_HAND',
      operator: 'LESS_THAN',
      threshold: 10,
      actionType: 'CREATE_PURCHASE_REQUEST',
      evaluationMode: 'REALTIME',
    });

    expect(preview.actionType).toBe('CREATE_PURCHASE_REQUEST');
    expect(preview.triggeredRecord).toContain('PR-DRAFT-2026-0727');
    expect(preview.nextEvaluationAt).toBe('2026-07-27T08:30:00+07:00');
  });

  it('rejects invalid thresholds', () => {
    expect(() =>
      service.preview({
        ruleName: 'Broken Rule',
        threshold: 0,
      }),
    ).toThrow();
  });
});
