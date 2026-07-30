import { describe, expect, it } from 'vitest';

import { PortalDownloadService } from './portal-download.service';

describe('PortalDownloadService', () => {
  const service = new PortalDownloadService();

  it('returns ready-to-download assets for the portal catalog', () => {
    expect(service.getAvailableAssets()).toHaveLength(2);
    expect(service.getAvailableAssets().every((asset) => asset.status === 'AVAILABLE')).toBe(true);
  });

  it('rejects assets that are still being generated', () => {
    expect(() => service.assertAssetAvailable('GENERATING')).toThrowError(
      /not ready to be downloaded/i,
    );
  });

  it('exposes every supported document type for portal downloads', () => {
    expect(service.getAssetTypes()).toContain('INVOICE_PDF');
    expect(service.getAssetTypes()).toContain('GENERAL_DOCUMENT');
  });
});
