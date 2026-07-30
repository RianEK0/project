import { describe, expect, it } from 'vitest';

import { PlatformExperienceService } from './platform-experience.service';

describe('PlatformExperienceService', () => {
  const service = new PlatformExperienceService();

  it('marks experience controls as ready when branding and extension governance are strong', () => {
    const preview = service.previewReadiness({
      controlsExpected: 5,
      brandingCoveragePct: 90,
      marketplaceReadinessPct: 88,
      extensionGovernancePct: 91,
      controls: [
        {
          key: 'WHITE_LABEL',
          label: 'White Label',
          readinessPct: 92,
          governanceReady: true,
          routeCount: 2,
          primaryUseCase: 'Tenant-specific branding and naming',
          nextFocus: 'Add guided brand pack import.',
        },
        {
          key: 'PLUGIN_SYSTEM',
          label: 'Plugin System',
          readinessPct: 89,
          governanceReady: true,
          routeCount: 3,
          primaryUseCase: 'Governed app and connector extensibility',
          nextFocus: 'Expand plugin review policy.',
        },
        {
          key: 'THEME_BUILDER',
          label: 'Theme Builder',
          readinessPct: 90,
          governanceReady: true,
          routeCount: 2,
          primaryUseCase: 'Tenant-scoped token and shell customization',
          nextFocus: 'Add dashboard and portal preview presets.',
        },
        {
          key: 'MARKETPLACE',
          label: 'Marketplace',
          readinessPct: 88,
          governanceReady: true,
          routeCount: 2,
          primaryUseCase: 'Approved extension catalog and discovery surface',
          nextFocus: 'Add publishing review and pricing policy checks.',
        },
        {
          key: 'EXTENSION_SDK',
          label: 'Extension SDK',
          readinessPct: 90,
          governanceReady: true,
          routeCount: 2,
          primaryUseCase: 'Partner SDK for governed extension packaging',
          nextFocus: 'Finalize signing and release guidance.',
        },
      ],
    });

    expect(preview.status).toBe('READY');
  });

  it('blocks an experience control when governance is missing', () => {
    const preview = service.previewReadiness({
      controlsExpected: 5,
      brandingCoveragePct: 55,
      marketplaceReadinessPct: 44,
      extensionGovernancePct: 38,
      controls: [
        {
          key: 'MARKETPLACE',
          label: 'Marketplace',
          readinessPct: 73,
          governanceReady: false,
          routeCount: 2,
          primaryUseCase: 'Tenant-facing app discovery and add-on catalog',
          nextFocus: 'Introduce extension review and publishing checklist.',
        },
      ],
    });

    expect(preview.controls[0]?.status).toBe('BLOCKED');
    expect(preview.status).toBe('LIMITED');
  });
});
