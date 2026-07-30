import { describe, expect, it } from 'vitest';

import { AiDocumentReviewService } from './ai-document-review.service';

describe('AiDocumentReviewService', () => {
  const service = new AiDocumentReviewService();

  it('infers NDA review from file name and returns signature review status', () => {
    const result = service.analyze({
      fileName: 'vendor-nda-final.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 512000,
    });

    expect(result.documentType).toBe('NDA');
    expect(result.status).toBe('PENDING_SIGNATURE');
    expect(result.risks[0]?.severity).toBe('HIGH');
  });

  it('rejects unsupported review file types', () => {
    expect(() =>
      service.analyze({
        fileName: 'agreement.csv',
        mimeType: 'text/csv',
        sizeBytes: 2000,
      }),
    ).toThrow();
  });
});
