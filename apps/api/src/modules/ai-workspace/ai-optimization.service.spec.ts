import { describe, expect, it } from 'vitest';

import { AiOptimizationService } from './ai-optimization.service';

describe('AiOptimizationService', () => {
  const service = new AiOptimizationService();

  it('marks optimization capabilities as ready when execution linkage is strong', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 4,
      recommendationCoveragePct: 92,
      executionLinkagePct: 90,
      crossDomainCoveragePct: 89,
      capabilities: [
        {
          key: 'AI_INVENTORY_OPTIMIZATION',
          label: 'AI Inventory Optimization',
          readinessPct: 91,
          executionReady: true,
          routeCount: 3,
          primaryUseCase: 'Replenishment and stock-health optimization guidance',
          nextFocus: 'Add lot-sensitive replenishment hints.',
        },
        {
          key: 'AI_PROCUREMENT_OPTIMIZATION',
          label: 'AI Procurement Optimization',
          readinessPct: 90,
          executionReady: true,
          routeCount: 3,
          primaryUseCase: 'Sourcing and supplier decision optimization',
          nextFocus: 'Expand award simulation paths.',
        },
        {
          key: 'AI_SALES_RECOMMENDATION',
          label: 'AI Sales Recommendation',
          readinessPct: 89,
          executionReady: true,
          routeCount: 3,
          primaryUseCase: 'Pipeline and commercial action prioritization',
          nextFocus: 'Map incentive-aware recommendation logic.',
        },
        {
          key: 'AI_WAREHOUSE_OPTIMIZATION',
          label: 'AI Warehouse Optimization',
          readinessPct: 90,
          executionReady: true,
          routeCount: 3,
          primaryUseCase: 'Slotting, task, and throughput optimization guidance',
          nextFocus: 'Expand congestion-aware wave suggestions.',
        },
      ],
    });

    expect(preview.status).toBe('READY');
  });

  it('blocks an optimization capability when execution handoff is missing', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 4,
      recommendationCoveragePct: 54,
      executionLinkagePct: 46,
      crossDomainCoveragePct: 42,
      capabilities: [
        {
          key: 'AI_WAREHOUSE_OPTIMIZATION',
          label: 'AI Warehouse Optimization',
          readinessPct: 76,
          executionReady: false,
          routeCount: 3,
          primaryUseCase: 'Task and slotting optimization in warehouse flows',
          nextFocus: 'Wire operator feedback and acceptance flow.',
        },
      ],
    });

    expect(preview.capabilities[0]?.status).toBe('BLOCKED');
    expect(preview.status).toBe('LIMITED');
  });
});
