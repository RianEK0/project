import { describe, expect, it } from 'vitest';

import { SalesReturnWorkflowService } from './sales-return-workflow.service';

describe('SalesReturnWorkflowService', () => {
  const service = new SalesReturnWorkflowService();

  it('allows received returns to proceed to credit', () => {
    expect(service.canTransition('RECEIVED', 'CREDIT_ISSUED')).toBe(true);
    expect(() => service.assertCreditNoteAllowed('RECEIVED')).not.toThrow();
  });

  it('rejects invalid return transitions', () => {
    expect(() => service.assertTransition('REQUESTED', 'CLOSED')).toThrowError(
      /transition from requested to closed is not allowed/i,
    );
  });

  it('blocks credit note issuance before the goods are received', () => {
    expect(() => service.assertCreditNoteAllowed('APPROVED')).toThrowError(
      /has not been received yet/i,
    );
  });
});
