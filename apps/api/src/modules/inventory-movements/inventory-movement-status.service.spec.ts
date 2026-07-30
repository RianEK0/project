import { describe, expect, it } from 'vitest';

import { InventoryMovementStatusService } from './inventory-movement-status.service';

describe('InventoryMovementStatusService', () => {
  const service = new InventoryMovementStatusService();

  it('allows the main warehouse execution flow', () => {
    expect(service.canTransition('DRAFT', 'PENDING_APPROVAL')).toBe(true);
    expect(service.canTransition('APPROVED', 'ALLOCATED')).toBe(true);
    expect(service.canTransition('IN_PROGRESS', 'COMPLETED')).toBe(true);
  });

  it('supports reversal only after completion', () => {
    expect(service.canTransition('COMPLETED', 'REVERSED')).toBe(true);
    expect(service.canTransition('APPROVED', 'REVERSED')).toBe(false);
  });

  it('rejects invalid transitions', () => {
    expect(() => service.assertTransition('CANCELLED', 'IN_PROGRESS')).toThrowError(
      /transition from CANCELLED to IN_PROGRESS is not allowed/i,
    );
  });

  it('marks issue-like movements as approval-gated', () => {
    expect(service.requiresApproval('ISSUE')).toBe(true);
    expect(service.requiresApproval('RECEIPT')).toBe(false);
  });
});
