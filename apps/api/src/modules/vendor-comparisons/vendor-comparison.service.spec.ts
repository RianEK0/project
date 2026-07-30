import { describe, expect, it } from 'vitest';

import { VendorComparisonService } from './vendor-comparison.service';

describe('VendorComparisonService', () => {
  const service = new VendorComparisonService();
  const quotations = [
    {
      quotationId: 'q-1',
      supplierId: 'supplier-a',
      supplierName: 'Supplier A',
      unitPrice: '100',
      leadTimeDays: 7,
      qualityScore: 92,
      onTimeRate: 94,
    },
    {
      quotationId: 'q-2',
      supplierId: 'supplier-b',
      supplierName: 'Supplier B',
      unitPrice: '96',
      leadTimeDays: 10,
      qualityScore: 85,
      onTimeRate: 80,
    },
    {
      quotationId: 'q-3',
      supplierId: 'supplier-c',
      supplierName: 'Supplier C',
      unitPrice: '103',
      leadTimeDays: 5,
      qualityScore: 90,
      onTimeRate: 97,
    },
  ] as const;

  it('produces a ranked recommendation set', () => {
    const result = service.compare(quotations);

    expect(result.rankings).toHaveLength(3);
    expect(result.recommendedQuotationId).toBe(result.rankings[0]?.quotationId);
    expect(result.rankings[0]?.recommended).toBe(true);
  });

  it('can bias the outcome with custom weights', () => {
    const result = service.compare(quotations, {
      leadTime: 0.6,
      price: 0.2,
      quality: 0.1,
      onTime: 0.1,
    });

    expect(result.rankings[0]?.quotationId).toBe('q-3');
  });

  it('requires at least two quotations', () => {
    expect(() => service.compare(quotations.slice(0, 1))).toThrowError(
      /at least two supplier quotations/i,
    );
  });
});
