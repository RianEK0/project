import { describe, expect, it } from 'vitest';

import { ChatErpOrchestrationService } from './chat-erp-orchestration.service';

describe('ChatErpOrchestrationService', () => {
  const service = new ChatErpOrchestrationService();

  it('routes inventory prompts to the inventory copilot lane', () => {
    expect(
      service.previewRoute({
        prompt: 'Show inventory risk for low stock items by warehouse.',
      }),
    ).toMatchObject({
      domain: 'INVENTORY',
      insightType: 'SEARCH',
      modelMode: 'RULE_BASED',
    });
  });

  it('routes recommendation prompts to hybrid reasoning', () => {
    expect(
      service.previewRoute({
        prompt: 'Recommend which vendor should receive the next RFQ for urgent items.',
      }),
    ).toMatchObject({
      domain: 'PROCUREMENT',
      insightType: 'RECOMMENDATION',
      modelMode: 'HYBRID',
    });
  });

  it('rejects unsupported preferred domains', () => {
    expect(() =>
      service.previewRoute({
        prompt: 'Summarize enterprise activity.',
        preferredDomain: 'LEGAL',
      }),
    ).toThrowError(/no ai route is configured/i);
  });
});
