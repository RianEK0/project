import { describe, expect, it } from 'vitest';

import { SalesPipelineService } from './sales-pipeline.service';

describe('SalesPipelineService', () => {
  const service = new SalesPipelineService();

  it('summarizes weighted pipeline and highlights the most stalled open stage', () => {
    const summary = service.summarize([
      { stage: 'LEAD', openCount: 12, openValue: 12000000, stalledDays: 3 },
      { stage: 'OPPORTUNITY', openCount: 6, openValue: 18000000, stalledDays: 5 },
      { stage: 'QUOTATION', openCount: 4, openValue: 24000000, stalledDays: 12 },
      { stage: 'NEGOTIATION', openCount: 2, openValue: 16000000, stalledDays: 9 },
      { stage: 'WON', openCount: 3, openValue: 20000000 },
      { stage: 'LOST', openCount: 1, openValue: 5000000 },
    ]);

    expect(summary.weightedOpenValue).toBe(31700000);
    expect(summary.winRate).toBe(75);
    expect(summary.stalledStage).toBe('QUOTATION');
  });

  it('requires at least one snapshot row', () => {
    expect(() => service.summarize([])).toThrowError(/requires at least one stage snapshot/i);
  });
});
