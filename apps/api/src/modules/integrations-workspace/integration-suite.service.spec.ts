import { describe, expect, it } from 'vitest';

import { IntegrationSuiteService } from './integration-suite.service';

describe('IntegrationSuiteService', () => {
  const service = new IntegrationSuiteService();

  it('marks the suite portfolio as ready when Google and Microsoft are fully prepared', () => {
    const preview = service.previewPortfolio({
      providersExpected: 2,
      directorySyncCoveragePct: 95,
      calendarSyncCoveragePct: 94,
      documentCollaborationCoveragePct: 90,
      providers: [
        {
          key: 'GOOGLE',
          label: 'Google',
          authModes: ['OAUTH2', 'SERVICE_ACCOUNT'],
          readinessPct: 93,
          directoryReady: true,
          routeCount: 3,
          primaryUseCase: 'Workspace identity and calendar federation',
          nextFocus: 'Expand document classification defaults.',
        },
        {
          key: 'MICROSOFT',
          label: 'Microsoft',
          authModes: ['OAUTH2', 'SERVICE_ACCOUNT'],
          readinessPct: 91,
          directoryReady: true,
          routeCount: 3,
          primaryUseCase: 'Entra identity and M365 schedule sync',
          nextFocus: 'Tighten tenant consent monitoring.',
        },
      ],
    });

    expect(preview.status).toBe('READY');
    expect(preview.connectedProviders).toBe(2);
  });

  it('blocks a provider when directory readiness is missing', () => {
    const preview = service.previewPortfolio({
      providersExpected: 2,
      directorySyncCoveragePct: 42,
      calendarSyncCoveragePct: 55,
      documentCollaborationCoveragePct: 48,
      providers: [
        {
          key: 'GOOGLE',
          label: 'Google',
          authModes: ['OAUTH2', 'SERVICE_ACCOUNT'],
          readinessPct: 74,
          directoryReady: false,
          routeCount: 3,
          primaryUseCase: 'Workspace identity and calendar federation',
          nextFocus: 'Enable directory consent and group sync.',
        },
      ],
    });

    expect(preview.providers[0]?.status).toBe('BLOCKED');
    expect(preview.status).toBe('LIMITED');
  });
});
