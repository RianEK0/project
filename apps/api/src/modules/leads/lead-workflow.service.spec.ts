import { describe, expect, it } from 'vitest';

import { LeadWorkflowService } from './lead-workflow.service';

describe('LeadWorkflowService', () => {
  const service = new LeadWorkflowService();

  it('allows qualification and conversion path for a healthy lead', () => {
    expect(service.canTransition('CONTACTED', 'QUALIFIED')).toBe(true);
    expect(service.canConvert('QUALIFIED')).toBe(true);
  });

  it('rejects invalid status transitions', () => {
    expect(() => service.assertTransition('NEW', 'CONVERTED')).toThrowError(
      /transition from new to converted is not allowed/i,
    );
  });

  it('prevents conversion for unqualified or already converted leads', () => {
    expect(() => service.assertConversionAllowed('NEW')).toThrowError(/not ready to convert/i);
    expect(() => service.assertConversionAllowed('CONVERTED')).toThrowError(
      /already been converted/i,
    );
  });
});
