import { describe, expect, it } from 'vitest';

import { EnterpriseSecurityService } from './enterprise-security.service';

describe('EnterpriseSecurityService', () => {
  const service = new EnterpriseSecurityService();

  it('previews a ready zero trust rollout', () => {
    const preview = service.preview({
      programName: 'NovaERP Security Hardening',
      trustMode: 'ZERO_TRUST_FOUNDATION',
      identityMode: 'MFA_AND_PASSKEY',
      frameworks: ['SOC2_READY', 'ISO27001_READY'],
      enabledControls: ['ZERO_TRUST', 'MFA', 'PASSKEY', 'AUDIT_CENTER', 'SECRETS_VAULT'],
    });

    expect(preview.status).toBe('READY');
    expect(preview.securityReadinessDate).toBe('2026-08-12');
    expect(preview.passkeyRolloutPct).toBeGreaterThan(80);
  });

  it('rejects unsupported controls', () => {
    expect(() =>
      service.preview({
        programName: 'Broken Security',
        enabledControls: ['VPN_ONLY'],
      }),
    ).toThrowError(/unsupported enterprise security control/i);
  });
});
