import { describe, expect, it } from 'vitest';

import { DevopsPlatformService } from './devops-platform.service';

describe('DevopsPlatformService', () => {
  const service = new DevopsPlatformService();

  it('previews a release-ready Kubernetes platform', () => {
    const preview = service.preview({
      programName: 'NovaERP Delivery Platform',
      deploymentTarget: 'KUBERNETES',
      pipelineProvider: 'GITHUB_ACTIONS',
      environments: ['development', 'staging', 'production'],
      observabilityTools: ['GRAFANA', 'PROMETHEUS', 'SENTRY', 'OPENTELEMETRY'],
    });

    expect(preview.status).toBe('READY');
    expect(preview.clusterCount).toBe(3);
    expect(preview.releaseReadinessDate).toBe('2026-08-08');
  });

  it('rejects unsupported observability tools', () => {
    expect(() =>
      service.preview({
        programName: 'Broken Delivery',
        observabilityTools: ['DATADOG'],
      }),
    ).toThrowError(/unsupported observability tool/i);
  });
});
