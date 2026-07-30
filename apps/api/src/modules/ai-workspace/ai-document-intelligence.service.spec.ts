import { describe, expect, it } from 'vitest';

import { AiDocumentIntelligenceService } from './ai-document-intelligence.service';

describe('AiDocumentIntelligenceService', () => {
  const service = new AiDocumentIntelligenceService();

  it('marks document intelligence as ready when extraction and review governance are strong', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 4,
      extractionCoveragePct: 91,
      confidenceCoveragePct: 90,
      reviewGovernancePct: 89,
      capabilities: [
        {
          key: 'AI_DOCUMENT_OCR',
          label: 'AI Document OCR',
          readinessPct: 92,
          humanReviewReady: true,
          routeCount: 3,
          primaryUseCase: 'Digitize incoming documents into searchable content',
          nextFocus: 'Expand multilingual OCR presets.',
        },
        {
          key: 'AI_INVOICE_EXTRACTION',
          label: 'AI Invoice Extraction',
          readinessPct: 90,
          humanReviewReady: true,
          routeCount: 3,
          primaryUseCase: 'Capture invoice fields for finance and procurement workflows',
          nextFocus: 'Tighten tax and vendor confidence checks.',
        },
        {
          key: 'AI_RECEIPT_EXTRACTION',
          label: 'AI Receipt Extraction',
          readinessPct: 89,
          humanReviewReady: true,
          routeCount: 3,
          primaryUseCase: 'Extract receipt lines for warehouse and expense review',
          nextFocus: 'Improve partial-capture exception handling.',
        },
        {
          key: 'AI_CONTRACT_ANALYSIS',
          label: 'AI Contract Analysis',
          readinessPct: 90,
          humanReviewReady: true,
          routeCount: 2,
          primaryUseCase: 'Review terms, obligations, and risk clauses in business documents',
          nextFocus: 'Expand obligation-summary templates.',
        },
      ],
    });

    expect(preview.status).toBe('READY');
  });

  it('blocks a document intelligence capability when human review is missing', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 4,
      extractionCoveragePct: 50,
      confidenceCoveragePct: 47,
      reviewGovernancePct: 39,
      capabilities: [
        {
          key: 'AI_INVOICE_EXTRACTION',
          label: 'AI Invoice Extraction',
          readinessPct: 74,
          humanReviewReady: false,
          routeCount: 3,
          primaryUseCase: 'Invoice field extraction for finance ops',
          nextFocus: 'Add reviewer sign-off and confidence routing.',
        },
      ],
    });

    expect(preview.capabilities[0]?.status).toBe('BLOCKED');
    expect(preview.status).toBe('LIMITED');
  });
});
