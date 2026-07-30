import { describe, expect, it } from 'vitest';

import { PlatformTopologyService } from './platform-topology.service';

describe('PlatformTopologyService', () => {
  const service = new PlatformTopologyService();

  it('marks topology as ready when multi-entity coverage is strong', () => {
    const preview = service.previewReadiness({
      controlsExpected: 6,
      companyScopePct: 92,
      branchCoveragePct: 90,
      warehouseCoveragePct: 94,
      localeCoveragePct: 88,
      controls: [
        {
          key: 'MULTI_COMPANY',
          label: 'Multi Company',
          readinessPct: 95,
          policyReady: true,
          routeCount: 3,
          primaryUseCase: 'Separate legal entities under one platform shell',
          nextFocus: 'Add guided entity provisioning.',
        },
        {
          key: 'MULTI_BRANCH',
          label: 'Multi Branch',
          readinessPct: 90,
          policyReady: true,
          routeCount: 3,
          primaryUseCase: 'Distributed operating branches with local defaults',
          nextFocus: 'Expand branch policy templates.',
        },
        {
          key: 'MULTI_WAREHOUSE',
          label: 'Multi Warehouse',
          readinessPct: 93,
          policyReady: true,
          routeCount: 3,
          primaryUseCase: 'Coordinate warehouse network policies across the tenant',
          nextFocus: 'Add default provisioning packs for new branches.',
        },
        {
          key: 'MULTI_CURRENCY',
          label: 'Multi Currency',
          readinessPct: 91,
          policyReady: true,
          routeCount: 2,
          primaryUseCase: 'Support pricing and finance flows across multiple currencies',
          nextFocus: 'Tighten document-level settlement controls.',
        },
        {
          key: 'MULTI_LANGUAGE',
          label: 'Multi Language',
          readinessPct: 89,
          policyReady: true,
          routeCount: 2,
          primaryUseCase: 'Enable multilingual tenant and portal experiences',
          nextFocus: 'Expand translation coverage for operational routes.',
        },
        {
          key: 'TIMEZONE',
          label: 'Timezone',
          readinessPct: 90,
          policyReady: true,
          routeCount: 3,
          primaryUseCase: 'Keep audit, scheduling, and automation times aligned globally',
          nextFocus: 'Propagate tenant defaults into reporting windows.',
        },
      ],
    });

    expect(preview.status).toBe('READY');
  });

  it('blocks a topology control when policy readiness is missing', () => {
    const preview = service.previewReadiness({
      controlsExpected: 6,
      companyScopePct: 48,
      branchCoveragePct: 52,
      warehouseCoveragePct: 61,
      localeCoveragePct: 57,
      controls: [
        {
          key: 'MULTI_COMPANY',
          label: 'Multi Company',
          readinessPct: 76,
          policyReady: false,
          routeCount: 3,
          primaryUseCase: 'Separate legal entities under one platform shell',
          nextFocus: 'Define cross-company scope rules.',
        },
      ],
    });

    expect(preview.controls[0]?.status).toBe('BLOCKED');
    expect(preview.status).toBe('LIMITED');
  });
});
