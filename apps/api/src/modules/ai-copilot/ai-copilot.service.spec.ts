import { describe, expect, it } from 'vitest';

import { AiCopilotService } from './ai-copilot.service';

describe('AiCopilotService', () => {
  const service = new AiCopilotService();

  it('builds a safe sales report preview from a natural-language request', () => {
    const preview = service.preview({
      prompt: 'Buat laporan penjualan bulan lalu.',
    });

    expect(preview.intentType).toBe('SALES_REPORT');
    expect(preview.executionStatus).toBe('SAFE_QUERY_READY');
    expect(preview.coverageWindow).toBe('June 1, 2026 - June 30, 2026');
  });

  it('builds a replenishment draft when the prompt asks about urgent stock', () => {
    const preview = service.preview({
      prompt: 'Stok apa yang perlu segera dipesan?',
    });

    expect(preview.intentType).toBe('REPLENISHMENT_RECOMMENDATION');
    expect(preview.executionStatus).toBe('DRAFT_ACTION_READY');
  });

  it('rejects an empty prompt', () => {
    expect(() => service.preview({ prompt: '   ' })).toThrowError(/copilot prompt is required/i);
  });
});
