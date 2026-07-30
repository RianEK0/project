import { describe, expect, it } from 'vitest';

import { MobilePwaReadinessService } from './mobile-pwa-readiness.service';

describe('MobilePwaReadinessService', () => {
  const service = new MobilePwaReadinessService();

  it('marks pwa readiness as ready when manifest, service worker, and coverage are complete', () => {
    const preview = service.previewReadiness({
      coreScreens: 5,
      offlineReadyScreens: 5,
      expectedShortcuts: 4,
      configuredShortcuts: 4,
      manifestEnabled: true,
      serviceWorkerEnabled: true,
      pushEnabled: true,
    });

    expect(preview.status).toBe('READY');
    expect(preview.installable).toBe(true);
  });

  it('marks pwa readiness as blocked when manifest or service worker is missing', () => {
    const preview = service.previewReadiness({
      coreScreens: 5,
      offlineReadyScreens: 5,
      expectedShortcuts: 4,
      configuredShortcuts: 4,
      manifestEnabled: false,
      serviceWorkerEnabled: true,
      pushEnabled: false,
    });

    expect(preview.status).toBe('BLOCKED');
    expect(preview.installable).toBe(false);
  });
});
