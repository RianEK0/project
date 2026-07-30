import { describe, expect, it } from 'vitest';

import { GlobalEnterpriseService } from './global-enterprise.service';

describe('GlobalEnterpriseService', () => {
  const service = new GlobalEnterpriseService();

  it('previews a ready global rollout at the stated hyperscale target', () => {
    const preview = service.preview({
      programName: 'NovaERP Global Rollout',
      deploymentModel: 'GLOBAL_FEDERATION',
      topologyMode: 'REGIONAL_HUBS',
      companyCount: 1_000,
      branchCount: 10_000,
      userCount: 100_000,
      unlimitedDimensions: ['WAREHOUSE', 'STORE', 'CURRENCY', 'LANGUAGE', 'THEME'],
    });

    expect(preview.status).toBe('READY');
    expect(preview.globalRolloutDate).toBe('2026-07-31');
    expect(preview.recommendedShardCount).toBe(4);
  });

  it('rejects a branch count lower than company count', () => {
    expect(() =>
      service.preview({
        programName: 'Broken Rollout',
        companyCount: 12,
        branchCount: 4,
        userCount: 200,
      }),
    ).toThrowError(/Branch count must be greater than or equal to company count/);
  });
});
