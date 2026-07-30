import { describe, expect, it } from 'vitest';

import { DocumentFormatsService } from './document-formats.service';

describe('DocumentFormatsService', () => {
  const service = new DocumentFormatsService();

  it('marks document formats as ready when format continuity is strong', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 3,
      previewSupportPct: 92,
      editingContinuityPct: 90,
      searchabilityPct: 89,
      capabilities: [
        {
          key: 'PDF_LIBRARY',
          label: 'PDF',
          readinessPct: 92,
          previewReady: true,
          routeCount: 3,
          primaryUseCase: 'Review governed PDFs for invoices, SOPs, and operational evidence',
          nextFocus: 'Add richer annotation overlays for reviewed PDFs.',
        },
        {
          key: 'WORD_LIBRARY',
          label: 'Word',
          readinessPct: 90,
          previewReady: true,
          routeCount: 3,
          primaryUseCase: 'Coordinate editable drafts for policies, manuals, and contracts',
          nextFocus: 'Improve tracked-change and approval-oriented previews.',
        },
        {
          key: 'EXCEL_LIBRARY',
          label: 'Excel',
          readinessPct: 89,
          previewReady: true,
          routeCount: 3,
          primaryUseCase:
            'Review governed spreadsheets for budgets, price history, and planning packs',
          nextFocus: 'Add stronger workbook lineage and export history.',
        },
      ],
    });

    expect(preview.status).toBe('READY');
  });

  it('blocks a document format capability when preview readiness is missing', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 3,
      previewSupportPct: 58,
      editingContinuityPct: 54,
      searchabilityPct: 50,
      capabilities: [
        {
          key: 'WORD_LIBRARY',
          label: 'Word',
          readinessPct: 74,
          previewReady: false,
          routeCount: 2,
          primaryUseCase: 'Policy draft review',
          nextFocus: 'Stabilize preview fidelity and metadata indexing.',
        },
      ],
    });

    expect(preview.capabilities[0]?.status).toBe('BLOCKED');
    expect(preview.status).toBe('LIMITED');
  });
});
