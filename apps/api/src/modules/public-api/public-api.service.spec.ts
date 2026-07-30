import { describe, expect, it } from 'vitest';

import { PublicApiService } from './public-api.service';

describe('PublicApiService', () => {
  const service = new PublicApiService();

  it('previews an SDK program with a required language', () => {
    const preview = service.preview({
      programName: 'NovaERP Developer Platform',
      protocol: 'SDK',
      sdkLanguage: 'TYPESCRIPT',
      domain: 'Procurement',
    });

    expect(preview.status).toBe('READY');
    expect(preview.sdkPackageName).toBe('@nova/sdk-typescript');
    expect(preview.publishWindowDate).toBe('2026-08-03');
  });

  it('rejects sdk preview without a language', () => {
    expect(() =>
      service.preview({
        programName: 'Broken SDK Preview',
        protocol: 'SDK',
        domain: 'Inventory',
      }),
    ).toThrowError(/SDK language is required/);
  });
});
