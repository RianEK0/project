import { describe, expect, it } from 'vitest';

import { IntegrationAiService } from './integration-ai.service';

describe('IntegrationAiService', () => {
  const service = new IntegrationAiService();

  it('marks the AI portfolio as ready when guardrails and routing are strong', () => {
    const preview = service.previewPortfolio({
      providersExpected: 3,
      promptGovernancePct: 94,
      fallbackCoveragePct: 91,
      modelRoutingCoveragePct: 90,
      providers: [
        {
          key: 'OPENAI',
          label: 'OpenAI',
          authModes: ['API_KEY'],
          readinessPct: 95,
          guardrailReady: true,
          routeCount: 4,
          primaryUseCase: 'Chat ERP and report generation',
          nextFocus: 'Tune per-domain routing policy.',
        },
        {
          key: 'CLAUDE',
          label: 'Claude',
          authModes: ['API_KEY'],
          readinessPct: 89,
          guardrailReady: true,
          routeCount: 3,
          primaryUseCase: 'Long-form reasoning and document analysis',
          nextFocus: 'Expand fallback prompts.',
        },
        {
          key: 'GEMINI',
          label: 'Gemini',
          authModes: ['API_KEY', 'SERVICE_ACCOUNT'],
          readinessPct: 90,
          guardrailReady: true,
          routeCount: 3,
          primaryUseCase: 'Search-assisted and multimodal workflow support',
          nextFocus: 'Tune multimodal routing thresholds.',
        },
      ],
    });

    expect(preview.status).toBe('READY');
  });

  it('blocks an AI provider when guardrails are not ready', () => {
    const preview = service.previewPortfolio({
      providersExpected: 3,
      promptGovernancePct: 45,
      fallbackCoveragePct: 52,
      modelRoutingCoveragePct: 48,
      providers: [
        {
          key: 'GEMINI',
          label: 'Gemini',
          authModes: ['API_KEY', 'SERVICE_ACCOUNT'],
          readinessPct: 78,
          guardrailReady: false,
          routeCount: 3,
          primaryUseCase: 'Search and multimodal workflow support',
          nextFocus: 'Turn on prompt redaction and budget caps.',
        },
      ],
    });

    expect(preview.providers[0]?.status).toBe('BLOCKED');
    expect(preview.status).toBe('LIMITED');
  });
});
