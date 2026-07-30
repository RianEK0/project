import { describe, expect, it } from 'vitest';

import { PurchaseOrderWorkflowService } from './purchase-order-workflow.service';

describe('PurchaseOrderWorkflowService', () => {
  const service = new PurchaseOrderWorkflowService();

  it('supports approval to receiving progression', () => {
    expect(service.canTransition('PENDING_APPROVAL', 'APPROVED')).toBe(true);
    expect(service.canTransition('APPROVED', 'SENT')).toBe(true);
    expect(service.canTransition('SENT', 'PARTIALLY_RECEIVED')).toBe(true);
  });

  it('allows invoice preparation only after receipt starts', () => {
    expect(service.canPrepareInvoice('PARTIALLY_RECEIVED')).toBe(true);
    expect(service.canPrepareInvoice('SENT')).toBe(false);
  });

  it('throws when invoice prep is attempted too early', () => {
    expect(() => service.assertInvoicePreparationAllowed('APPROVED')).toThrowError(
      /not ready for invoice preparation/i,
    );
  });
});
