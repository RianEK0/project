import { describe, expect, it } from 'vitest';

import { SalesOrderWorkflowService } from './sales-order-workflow.service';

describe('SalesOrderWorkflowService', () => {
  const service = new SalesOrderWorkflowService();

  it('allows delivery and invoicing progression for approved orders', () => {
    expect(service.canTransition('APPROVED', 'ALLOCATED')).toBe(true);
    expect(service.canInvoice('DELIVERED')).toBe(true);
  });

  it('rejects invalid sales order transitions', () => {
    expect(() => service.assertTransition('DRAFT', 'DELIVERED')).toThrowError(
      /transition from draft to delivered is not allowed/i,
    );
  });

  it('blocks invoicing for orders already invoiced or not yet delivered', () => {
    expect(() => service.assertInvoiceAllowed('ALLOCATED')).toThrowError(
      /not ready for invoicing/i,
    );
    expect(() => service.assertInvoiceAllowed('INVOICED')).toThrowError(/already been invoiced/i);
  });
});
