import { describe, expect, it } from 'vitest';

import { InventoryAvailabilityService } from './inventory-availability.service';

describe('InventoryAvailabilityService', () => {
  const service = new InventoryAvailabilityService();

  it('summarizes available and projected stock', () => {
    expect(
      service.summarize({
        onHandQuantity: '48',
        reservedQuantity: '6',
        damagedQuantity: '1',
        quarantineQuantity: '2',
        incomingQuantity: '10',
        outgoingQuantity: '4',
      }),
    ).toEqual({
      onHand: 48,
      reserved: 6,
      available: 39,
      projected: 45,
      damaged: 1,
      quarantine: 2,
    });
  });

  it('blocks reservations when stock is insufficient', () => {
    const summary = service.summarize({
      onHandQuantity: '10',
      reservedQuantity: '4',
    });

    expect(() => service.assertReservable(summary, '7')).toThrow(
      'Requested quantity 7 exceeds available quantity 6.',
    );
  });

  it('allows over-allocation only when negative stock is explicitly enabled', () => {
    const summary = service.summarize({
      onHandQuantity: '5',
      reservedQuantity: '4',
    });

    expect(() => service.assertReservable(summary, '2', true)).not.toThrow();
  });
});
