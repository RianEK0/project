import { describe, expect, it } from 'vitest';

import { PluginMarketplaceService } from './plugin-marketplace.service';

describe('PluginMarketplaceService', () => {
  const service = new PluginMarketplaceService();

  it('previews a ready one-click plugin rollout for approved verticals', () => {
    const preview = service.preview({
      marketplaceName: 'NovaERP Vertical Marketplace',
      installScope: 'TENANT',
      plugins: [
        {
          id: 'pos-suite',
          label: 'POS Suite',
          vertical: 'POS',
          packageType: 'VERTICAL_APP',
        },
        {
          id: 'restaurant-pack',
          label: 'Restaurant Pack',
          vertical: 'RESTAURANT',
          packageType: 'WORKFLOW_ADDON',
        },
      ],
    });

    expect(preview.status).toBe('READY');
    expect(preview.oneClickLaunchDate).toBe('2026-07-30');
    expect(preview.pluginCount).toBe(2);
  });

  it('rejects unsupported plugin verticals', () => {
    expect(() =>
      service.preview({
        marketplaceName: 'Broken Marketplace',
        plugins: [
          {
            id: 'broken',
            label: 'Broken Plugin',
            vertical: 'BANKING',
            packageType: 'VERTICAL_APP',
          },
        ],
      }),
    ).toThrowError(/Unsupported plugin vertical/);
  });
});
