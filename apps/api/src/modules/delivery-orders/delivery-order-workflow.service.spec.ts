import { describe, expect, it } from 'vitest';

import { DeliveryOrderWorkflowService } from './delivery-order-workflow.service';

describe('DeliveryOrderWorkflowService', () => {
  const service = new DeliveryOrderWorkflowService();

  it('allows packed deliveries to be dispatched', () => {
    expect(service.canTransition('PACKED', 'DISPATCHED')).toBe(true);
    expect(() => service.assertDispatchReady('PACKED')).not.toThrow();
  });

  it('rejects invalid delivery transitions', () => {
    expect(() => service.assertTransition('DRAFT', 'DELIVERED')).toThrowError(
      /transition from draft to delivered is not allowed/i,
    );
  });

  it('requires packed status before dispatch', () => {
    expect(() => service.assertDispatchReady('PICKING')).toThrowError(/not ready to dispatch/i);
  });
});
