import { describe, expect, it } from 'vitest';

import { NovaOsService } from './nova-os.service';

describe('NovaOsService', () => {
  const service = new NovaOsService();

  it('previews a launch-ready NovaOS control plane', () => {
    const preview = service.preview({
      programName: 'NovaOS Platform Shell',
      deploymentMode: 'MULTI_REGION_FABRIC',
      collaborationMode: 'LIVE_MULTIPLAYER',
      studios: [
        'VISUAL_WORKFLOW_STUDIO',
        'AI_STUDIO',
        'EVENT_BUS',
        'API_GATEWAY',
        'FEATURE_FLAGS',
        'TENANT_MIGRATION',
      ],
      regions: ['jakarta-1', 'singapore-1'],
    });

    expect(preview.status).toBe('READY');
    expect(preview.migrationWaveDate).toBe('2026-08-14');
    expect(preview.regions).toHaveLength(2);
  });

  it('rejects unsupported studio names', () => {
    expect(() =>
      service.preview({
        programName: 'Broken NovaOS',
        studios: ['METAVERSE_MODE'],
      }),
    ).toThrowError(/unsupported novaos studio/i);
  });
});
