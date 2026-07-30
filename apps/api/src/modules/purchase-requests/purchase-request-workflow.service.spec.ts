import { describe, expect, it } from 'vitest';

import { PurchaseRequestWorkflowService } from './purchase-request-workflow.service';

describe('PurchaseRequestWorkflowService', () => {
  const service = new PurchaseRequestWorkflowService();

  it('supports the request-to-sourcing lifecycle', () => {
    expect(service.canTransition('DRAFT', 'SUBMITTED')).toBe(true);
    expect(service.canTransition('PENDING_APPROVAL', 'APPROVED')).toBe(true);
    expect(service.canTransition('SOURCING', 'PARTIALLY_ORDERED')).toBe(true);
  });

  it('marks ordered requests as terminal', () => {
    expect(service.isTerminal('ORDERED')).toBe(true);
    expect(service.isTerminal('SOURCING')).toBe(false);
  });

  it('rejects invalid backwards transitions', () => {
    expect(() => service.assertTransition('ORDERED', 'APPROVED')).toThrowError(
      /transition from ORDERED to APPROVED is not allowed/i,
    );
  });
});
