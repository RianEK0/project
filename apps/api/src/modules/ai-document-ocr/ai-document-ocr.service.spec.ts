import { describe, expect, it } from 'vitest';

import { AiDocumentOcrService } from './ai-document-ocr.service';

describe('AiDocumentOcrService', () => {
  const service = new AiDocumentOcrService();

  it('infers invoice OCR extraction from the uploaded file name', () => {
    const result = service.extract({
      fileName: 'supplier-invoice-july.png',
      mimeType: 'image/png',
      sizeBytes: 204800,
    });

    expect(result.documentType).toBe('INVOICE');
    expect(result.supplier).toBe('PT Sumber Niaga Prima');
    expect(result.saveStatus).toBe('READY_TO_SAVE');
  });

  it('rejects unsupported mime types', () => {
    expect(() =>
      service.extract({
        fileName: 'invoice.txt',
        mimeType: 'text/plain',
        sizeBytes: 100,
      }),
    ).toThrow();
  });
});
