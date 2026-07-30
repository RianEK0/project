import { describe, expect, it } from 'vitest';

import { EnterpriseCloudService } from './enterprise-cloud.service';

describe('EnterpriseCloudService', () => {
  const service = new EnterpriseCloudService();

  it('previews a ready enterprise cloud control plane', () => {
    const preview = service.preview({
      programName: 'NovaERP Enterprise Cloud',
      tenancyMode: 'HYBRID_RESIDENCY',
      regionStrategy: 'ACTIVE_ACTIVE_MULTI_REGION',
      tenantCount: 1_800,
      regions: ['jakarta-1', 'singapore-1', 'frankfurt-1'],
      enabledLanes: ['SUBSCRIPTION', 'BILLING', 'BACKUP', 'RESTORE', 'MONITORING', 'SECURITY'],
    });

    expect(preview.status).toBe('READY');
    expect(preview.scaleReadinessDate).toBe('2026-08-06');
    expect(preview.regions).toHaveLength(3);
  });

  it('rejects a zero tenant count', () => {
    expect(() =>
      service.preview({
        programName: 'Broken Cloud',
        tenantCount: 0,
      }),
    ).toThrowError(/tenant count must be greater than zero/i);
  });
});
