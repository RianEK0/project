import { describe, expect, it } from 'vitest';

import { AnalyticsDomainOperationsService } from './analytics-domain-operations.service';

describe('AnalyticsDomainOperationsService', () => {
  const service = new AnalyticsDomainOperationsService();

  it('marks domain analytics as ready when mart and KPI coverage are strong', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 8,
      domainCoveragePct: 91,
      dashboardAlignmentPct: 90,
      crossProcessCoveragePct: 89,
      capabilities: [
        {
          key: 'INVENTORY_ANALYTICS',
          label: 'Inventory Analytics',
          readinessPct: 91,
          martReady: true,
          routeCount: 3,
          primaryUseCase: 'Track stock health, replenishment pressure, and inventory exposure',
          nextFocus: 'Expand aging and lot-sensitive BI views.',
        },
        {
          key: 'SALES_ANALYTICS',
          label: 'Sales Analytics',
          readinessPct: 90,
          martReady: true,
          routeCount: 3,
          primaryUseCase: 'Monitor order-to-cash, conversion, and collection momentum',
          nextFocus: 'Add more cohort and pipeline profitability rollups.',
        },
        {
          key: 'PURCHASE_ANALYTICS',
          label: 'Purchase Analytics',
          readinessPct: 89,
          martReady: true,
          routeCount: 3,
          primaryUseCase: 'Review sourcing flow, vendor responsiveness, and PO progression',
          nextFocus: 'Improve landed-cost and lead-time drill-downs.',
        },
        {
          key: 'ACCOUNTING_ANALYTICS',
          label: 'Accounting Analytics',
          readinessPct: 90,
          martReady: true,
          routeCount: 3,
          primaryUseCase: 'Read close discipline, journal health, and financial signal movement',
          nextFocus: 'Add close calendar and variance narratives.',
        },
        {
          key: 'HR_ANALYTICS',
          label: 'HR Analytics',
          readinessPct: 88,
          martReady: true,
          routeCount: 3,
          primaryUseCase: 'Track attendance, recruitment, review, and training signals',
          nextFocus: 'Expand retention and workforce planning slices.',
        },
        {
          key: 'MANUFACTURING_ANALYTICS',
          label: 'Manufacturing Analytics',
          readinessPct: 90,
          martReady: true,
          routeCount: 3,
          primaryUseCase: 'Monitor throughput, yield, shortages, and capacity signal flow',
          nextFocus: 'Broaden waste and maintenance loss views.',
        },
        {
          key: 'BOOKING_ANALYTICS',
          label: 'Booking Analytics',
          readinessPct: 89,
          martReady: true,
          routeCount: 3,
          primaryUseCase: 'Read booking demand, utilization, and payment completion signals',
          nextFocus: 'Expand segment and channel analysis.',
        },
        {
          key: 'CRM_ANALYTICS',
          label: 'CRM Analytics',
          readinessPct: 90,
          martReady: true,
          routeCount: 3,
          primaryUseCase: 'Track lead, opportunity, quotation, and weighted pipeline movement',
          nextFocus: 'Add conversion cohort and stalled-funnel stories.',
        },
      ],
    });

    expect(preview.status).toBe('READY');
  });

  it('blocks a domain capability when the mart is not ready', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 8,
      domainCoveragePct: 47,
      dashboardAlignmentPct: 51,
      crossProcessCoveragePct: 43,
      capabilities: [
        {
          key: 'ACCOUNTING_ANALYTICS',
          label: 'Accounting Analytics',
          readinessPct: 76,
          martReady: false,
          routeCount: 3,
          primaryUseCase: 'Close and financial signal analysis',
          nextFocus: 'Stabilize grain and posting-derived metric definitions.',
        },
      ],
    });

    expect(preview.capabilities[0]?.status).toBe('BLOCKED');
    expect(preview.status).toBe('LIMITED');
  });
});
