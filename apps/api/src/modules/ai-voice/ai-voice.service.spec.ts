import { describe, expect, it } from 'vitest';

import { AiVoiceService } from './ai-voice.service';

describe('AiVoiceService', () => {
  const service = new AiVoiceService();

  it('turns a spoken purchase order request into a draft preview', () => {
    const result = service.executePreview({
      transcript: 'Buat Purchase Order untuk Supplier ABC sebanyak 50 unit',
    });

    expect(result.intentType).toBe('CREATE_PURCHASE_ORDER');
    expect(result.executionStatus).toBe('DRAFT_CREATED');
    expect(result.generatedRecordNumber).toBe('PO-DRAFT-2026-0726-01');
  });

  it('rejects an empty transcript', () => {
    expect(() => service.executePreview({ transcript: '   ' })).toThrowError(
      /speech transcript is required/i,
    );
  });
});
