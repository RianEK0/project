import { describe, expect, it } from 'vitest';

import { PlatformIdentityService } from './platform-identity.service';

describe('PlatformIdentityService', () => {
  const service = new PlatformIdentityService();

  it('marks identity and trust controls as ready when federation and audit coverage are strong', () => {
    const preview = service.previewReadiness({
      controlsExpected: 5,
      auditCoveragePct: 93,
      complianceCoveragePct: 89,
      federationCoveragePct: 91,
      controls: [
        {
          key: 'AUDIT_CENTER',
          label: 'Audit Center',
          readinessPct: 94,
          federationReady: true,
          routeCount: 2,
          primaryUseCase: 'Centralize sensitive action review and retention oversight',
          nextFocus: 'Add export policy templates.',
        },
        {
          key: 'SSO',
          label: 'SSO',
          readinessPct: 90,
          federationReady: true,
          routeCount: 3,
          primaryUseCase: 'Enterprise identity federation for workforce login',
          nextFocus: 'Expand tenant onboarding checklist.',
        },
        {
          key: 'COMPLIANCE',
          label: 'Compliance',
          readinessPct: 91,
          federationReady: true,
          routeCount: 2,
          primaryUseCase: 'Track policy readiness and control evidence',
          nextFocus: 'Map more platform evidence to audit trails.',
        },
        {
          key: 'OAUTH',
          label: 'OAuth',
          readinessPct: 90,
          federationReady: true,
          routeCount: 3,
          primaryUseCase: 'Delegated auth for suites, connectors, and extensions',
          nextFocus: 'Tighten consent visibility and token rotation.',
        },
        {
          key: 'SAML',
          label: 'SAML',
          readinessPct: 89,
          federationReady: true,
          routeCount: 2,
          primaryUseCase: 'Enterprise identity provider federation with metadata exchange',
          nextFocus: 'Add certificate rollover playbooks.',
        },
      ],
    });

    expect(preview.status).toBe('READY');
  });

  it('blocks an identity control when federation readiness is missing', () => {
    const preview = service.previewReadiness({
      controlsExpected: 5,
      auditCoveragePct: 61,
      complianceCoveragePct: 49,
      federationCoveragePct: 43,
      controls: [
        {
          key: 'SAML',
          label: 'SAML',
          readinessPct: 75,
          federationReady: false,
          routeCount: 2,
          primaryUseCase: 'Enterprise identity provider federation',
          nextFocus: 'Complete metadata exchange and cert rotation defaults.',
        },
      ],
    });

    expect(preview.controls[0]?.status).toBe('BLOCKED');
    expect(preview.status).toBe('LIMITED');
  });
});
