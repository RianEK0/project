import { describe, expect, it } from 'vitest';

import { DocumentGovernanceService } from './document-governance.service';

describe('DocumentGovernanceService', () => {
  const service = new DocumentGovernanceService();

  it('marks governance documents as ready when SOP, training, and policy controls are strong', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 4,
      sopCoveragePct: 91,
      trainingCoveragePct: 89,
      policyControlPct: 90,
      capabilities: [
        {
          key: 'COMPANY_SOP',
          label: 'Company SOP',
          readinessPct: 91,
          publishReady: true,
          routeCount: 3,
          primaryUseCase: 'Publish standard operating procedures with governed ownership',
          nextFocus: 'Add stronger version evidence and acknowledgement tracking.',
        },
        {
          key: 'MANUAL_LIBRARY',
          label: 'Manual',
          readinessPct: 89,
          publishReady: true,
          routeCount: 3,
          primaryUseCase: 'Centralize operations and maintenance manuals for teams',
          nextFocus: 'Improve equipment-specific and role-specific manual bundles.',
        },
        {
          key: 'TRAINING_LIBRARY',
          label: 'Training',
          readinessPct: 90,
          publishReady: true,
          routeCount: 3,
          primaryUseCase: 'Deliver governed onboarding and recurring training materials',
          nextFocus: 'Add stronger course lineage and completion context.',
        },
        {
          key: 'POLICY_LIBRARY',
          label: 'Policy',
          readinessPct: 90,
          publishReady: true,
          routeCount: 3,
          primaryUseCase: 'Publish policies with clear ownership and review expectations',
          nextFocus: 'Broaden policy exception and acknowledgement workflows.',
        },
      ],
    });

    expect(preview.status).toBe('READY');
  });

  it('blocks a governance capability when publish readiness is missing', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 4,
      sopCoveragePct: 52,
      trainingCoveragePct: 58,
      policyControlPct: 49,
      capabilities: [
        {
          key: 'POLICY_LIBRARY',
          label: 'Policy',
          readinessPct: 73,
          publishReady: false,
          routeCount: 2,
          primaryUseCase: 'Governed policy publication',
          nextFocus: 'Stabilize ownership, review cycle, and sign-off controls.',
        },
      ],
    });

    expect(preview.capabilities[0]?.status).toBe('BLOCKED');
    expect(preview.status).toBe('LIMITED');
  });
});
