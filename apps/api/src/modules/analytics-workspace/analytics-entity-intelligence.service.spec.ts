import { describe, expect, it } from 'vitest';

import { AnalyticsEntityIntelligenceService } from './analytics-entity-intelligence.service';

describe('AnalyticsEntityIntelligenceService', () => {
  const service = new AnalyticsEntityIntelligenceService();

  it('marks entity intelligence as ready when customer, supplier, and warehouse coverage are strong', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 3,
      customerCoveragePct: 92,
      supplierCoveragePct: 90,
      warehouseCoveragePct: 89,
      capabilities: [
        {
          key: 'CUSTOMER_ANALYTICS',
          label: 'Customer Analytics',
          readinessPct: 91,
          entityReady: true,
          routeCount: 3,
          primaryUseCase: 'Track customer value, retention, service mix, and payment behavior',
          nextFocus: 'Add customer cohort and health segmentation.',
        },
        {
          key: 'SUPPLIER_ANALYTICS',
          label: 'Supplier Analytics',
          readinessPct: 90,
          entityReady: true,
          routeCount: 3,
          primaryUseCase: 'Review supplier responsiveness, dependency, and replenishment exposure',
          nextFocus: 'Expand vendor score and sourcing network views.',
        },
        {
          key: 'WAREHOUSE_ANALYTICS',
          label: 'Warehouse Analytics',
          readinessPct: 89,
          entityReady: true,
          routeCount: 3,
          primaryUseCase: 'Read throughput, congestion, and stock-control behavior by warehouse',
          nextFocus: 'Add inter-warehouse comparative drill-downs.',
        },
      ],
    });

    expect(preview.status).toBe('READY');
  });

  it('blocks an entity capability when entity coverage is not ready', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 3,
      customerCoveragePct: 54,
      supplierCoveragePct: 48,
      warehouseCoveragePct: 51,
      capabilities: [
        {
          key: 'CUSTOMER_ANALYTICS',
          label: 'Customer Analytics',
          readinessPct: 74,
          entityReady: false,
          routeCount: 3,
          primaryUseCase: 'Customer 360 analysis',
          nextFocus: 'Stabilize customer key lineage across booking, sales, and portal flows.',
        },
      ],
    });

    expect(preview.capabilities[0]?.status).toBe('BLOCKED');
    expect(preview.status).toBe('LIMITED');
  });
});
