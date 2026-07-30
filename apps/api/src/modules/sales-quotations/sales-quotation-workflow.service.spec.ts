import { describe, expect, it } from 'vitest';

import { SalesQuotationWorkflowService } from './sales-quotation-workflow.service';

describe('SalesQuotationWorkflowService', () => {
  const service = new SalesQuotationWorkflowService();

  it('allows progression from sent to accepted and converted', () => {
    expect(service.canTransition('SENT', 'ACCEPTED')).toBe(true);
    expect(service.canConvert('ACCEPTED')).toBe(true);
  });

  it('rejects invalid quotation transitions', () => {
    expect(() => service.assertTransition('DRAFT', 'ACCEPTED')).toThrowError(
      /transition from draft to accepted is not allowed/i,
    );
  });

  it('requires accepted status before conversion', () => {
    expect(() => service.assertConversionAllowed('SENT')).toThrowError(/not ready to convert/i);
  });
});
