import { describe, expect, it } from 'vitest';

import { DocumentRecordsService } from './document-records.service';

describe('DocumentRecordsService', () => {
  const service = new DocumentRecordsService();

  it('marks document records as ready when contract and invoice coverage are strong', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 2,
      contractCoveragePct: 91,
      invoiceCoveragePct: 90,
      approvalTraceabilityPct: 89,
      capabilities: [
        {
          key: 'CONTRACT_LIBRARY',
          label: 'Contract',
          readinessPct: 91,
          reviewReady: true,
          routeCount: 3,
          primaryUseCase: 'Track contract drafts, approvals, and governed references',
          nextFocus: 'Add richer renewal and obligation reminders.',
        },
        {
          key: 'INVOICE_LIBRARY',
          label: 'Invoice',
          readinessPct: 90,
          reviewReady: true,
          routeCount: 3,
          primaryUseCase: 'Review issued invoices, evidence, and preparation handoffs in one place',
          nextFocus: 'Tighten duplicate detection and exception routing.',
        },
      ],
    });

    expect(preview.status).toBe('READY');
  });

  it('blocks a record capability when review readiness is missing', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 2,
      contractCoveragePct: 56,
      invoiceCoveragePct: 61,
      approvalTraceabilityPct: 49,
      capabilities: [
        {
          key: 'CONTRACT_LIBRARY',
          label: 'Contract',
          readinessPct: 75,
          reviewReady: false,
          routeCount: 2,
          primaryUseCase: 'Contract review and approval',
          nextFocus: 'Stabilize owner assignment and approval traceability.',
        },
      ],
    });

    expect(preview.capabilities[0]?.status).toBe('BLOCKED');
    expect(preview.status).toBe('LIMITED');
  });
});
