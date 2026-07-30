import { describe, expect, it } from 'vitest';

import { InventoryAllocationPolicyService } from './inventory-allocation-policy.service';

describe('InventoryAllocationPolicyService', () => {
  const service = new InventoryAllocationPolicyService();
  const candidates = [
    {
      id: 'oldest',
      inventoryBalanceId: 'balance-oldest',
      availableQuantity: '5',
      inventoryStatus: 'AVAILABLE' as const,
      receivedAt: '2026-07-01T00:00:00.000Z',
      expirationDate: '2026-08-01T00:00:00.000Z',
    },
    {
      id: 'freshest',
      inventoryBalanceId: 'balance-freshest',
      availableQuantity: '8',
      inventoryStatus: 'AVAILABLE' as const,
      receivedAt: '2026-07-10T00:00:00.000Z',
      expirationDate: '2026-07-25T00:00:00.000Z',
    },
    {
      id: 'blocked',
      inventoryBalanceId: 'balance-blocked',
      availableQuantity: '10',
      inventoryStatus: 'BLOCKED' as const,
      receivedAt: '2026-06-20T00:00:00.000Z',
    },
  ] as const;

  it('uses FIFO by oldest receipt date', () => {
    const preview = service.preview({
      requiredQuantity: 6,
      strategy: 'FIFO',
      candidates,
      allowPartial: true,
    });

    expect(preview.allocations[0]?.candidateId).toBe('oldest');
    expect(preview.allocatedQuantity).toBe(6);
  });

  it('uses FEFO by earliest expiration', () => {
    const preview = service.preview({
      requiredQuantity: 4,
      strategy: 'FEFO',
      candidates,
      allowPartial: true,
    });

    expect(preview.allocations[0]?.candidateId).toBe('freshest');
  });

  it('ignores blocked stock', () => {
    const preview = service.preview({
      requiredQuantity: 12,
      strategy: 'FIFO',
      candidates,
      allowPartial: true,
    });

    expect(preview.allocations.map((allocation) => allocation.candidateId)).not.toContain(
      'blocked',
    );
  });

  it('fails when full allocation is required and stock is short', () => {
    expect(() =>
      service.preview({
        requiredQuantity: 20,
        strategy: 'FIFO',
        candidates,
      }),
    ).toThrowError(/insufficient allocatable stock/i);
  });
});
