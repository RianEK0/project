import { describe, expect, it } from 'vitest';

import { IntegrationStorageService } from './integration-storage.service';

describe('IntegrationStorageService', () => {
  const service = new IntegrationStorageService();

  it('marks the storage portfolio as ready when policy and redundancy coverage are high', () => {
    const preview = service.previewPortfolio({
      providersExpected: 4,
      retentionCoveragePct: 92,
      signedUrlCoveragePct: 95,
      backupRedundancyPct: 94,
      providers: [
        {
          key: 'DROPBOX',
          label: 'Dropbox',
          authModes: ['OAUTH2'],
          readinessPct: 90,
          retentionPolicyReady: true,
          routeCount: 2,
          primaryUseCase: 'Shared folder exchange for customer-facing documents',
          nextFocus: 'Add tenant template folders.',
        },
        {
          key: 'S3',
          label: 'S3',
          authModes: ['ACCESS_KEY'],
          readinessPct: 96,
          retentionPolicyReady: true,
          routeCount: 3,
          primaryUseCase: 'Primary export and archive store',
          nextFocus: 'Automate lifecycle class migration.',
        },
        {
          key: 'GOOGLE_DRIVE',
          label: 'Google Drive',
          authModes: ['OAUTH2'],
          readinessPct: 91,
          retentionPolicyReady: true,
          routeCount: 2,
          primaryUseCase: 'Collaborative document exchange with tenant teams',
          nextFocus: 'Add workspace folder policy templates.',
        },
        {
          key: 'ONEDRIVE',
          label: 'OneDrive',
          authModes: ['OAUTH2'],
          readinessPct: 89,
          retentionPolicyReady: true,
          routeCount: 2,
          primaryUseCase: 'Microsoft-centric file handoff and archive visibility',
          nextFocus: 'Expand sharing policy checks.',
        },
      ],
    });

    expect(preview.status).toBe('READY');
  });

  it('blocks a storage provider when retention policy readiness is missing', () => {
    const preview = service.previewPortfolio({
      providersExpected: 4,
      retentionCoveragePct: 41,
      signedUrlCoveragePct: 50,
      backupRedundancyPct: 46,
      providers: [
        {
          key: 'GOOGLE_DRIVE',
          label: 'Google Drive',
          authModes: ['OAUTH2'],
          readinessPct: 72,
          retentionPolicyReady: false,
          routeCount: 2,
          primaryUseCase: 'Collaborative document handoff',
          nextFocus: 'Define tenant retention labels and export folders.',
        },
      ],
    });

    expect(preview.providers[0]?.status).toBe('BLOCKED');
    expect(preview.status).toBe('LIMITED');
  });
});
