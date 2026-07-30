import { describe, expect, it } from 'vitest';

import { StockCountWorkflowService } from './stock-count-workflow.service';

describe('StockCountWorkflowService', () => {
  const service = new StockCountWorkflowService();

  it('supports the main count lifecycle', () => {
    expect(service.canTransition('DRAFT', 'SCHEDULED')).toBe(true);
    expect(service.canTransition('SCHEDULED', 'IN_PROGRESS')).toBe(true);
    expect(service.canTransition('SUBMITTED', 'APPROVED')).toBe(true);
  });

  it('blocks invalid backwards transitions', () => {
    expect(() => service.assertTransition('SUBMITTED', 'DRAFT')).toThrowError(
      /transition from SUBMITTED to DRAFT is not allowed/i,
    );
  });

  it('prevents stock mutation while freeze is active', () => {
    expect(() => service.assertMovementAllowed('IN_PROGRESS', true)).toThrowError(
      /freeze window is active/i,
    );
  });
});
