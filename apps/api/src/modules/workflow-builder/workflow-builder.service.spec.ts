import { describe, expect, it } from 'vitest';

import { WorkflowBuilderService } from './workflow-builder.service';

describe('WorkflowBuilderService', () => {
  const service = new WorkflowBuilderService();

  it('composes a purchase-order workflow preview', () => {
    const preview = service.preview({
      workflowName: 'PO Approval Cascade',
      eventKey: 'PURCHASE_ORDER_APPROVED',
      executionMode: 'SEQUENTIAL',
      steps: [
        { id: 's1', type: 'EMAIL', label: 'Send supplier email' },
        { id: 's2', type: 'WHATSAPP', label: 'Notify buyer on WhatsApp' },
        { id: 's3', type: 'CREATE_INVOICE', label: 'Create invoice' },
        { id: 's4', type: 'GENERATE_PDF', label: 'Generate PDF' },
      ],
    });

    expect(preview.status).toBe('READY');
    expect(preview.generatedArtifacts).toContain('Invoice draft');
    expect(preview.nextSimulationAt).toBe('2026-07-27T09:00:00+07:00');
  });

  it('rejects unsupported workflow step types', () => {
    expect(() =>
      service.preview({
        workflowName: 'Broken Flow',
        steps: [{ id: 's1', type: 'UNKNOWN', label: 'Nope' }],
      }),
    ).toThrow();
  });
});
