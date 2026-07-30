import { describe, expect, it } from 'vitest';

import { AiCommandCenterService } from './ai-command-center.service';

describe('AiCommandCenterService', () => {
  const service = new AiCommandCenterService();

  it('marks command center capabilities as ready when dashboard and orchestration signals are strong', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 3,
      dashboardCoveragePct: 93,
      orchestrationCoveragePct: 91,
      narrativeCoveragePct: 90,
      capabilities: [
        {
          key: 'AI_DASHBOARD',
          label: 'AI Dashboard',
          readinessPct: 92,
          orchestrationReady: true,
          routeCount: 3,
          primaryUseCase: 'Operational and executive AI scorecard review',
          nextFocus: 'Add tenant-scoped AI briefing layouts.',
        },
        {
          key: 'AI_CHAT',
          label: 'AI Chat',
          readinessPct: 91,
          orchestrationReady: true,
          routeCount: 3,
          primaryUseCase: 'Natural conversational entry point into NovaERP',
          nextFocus: 'Expand multi-domain prompt routing.',
        },
        {
          key: 'PREDICTIVE_ANALYTICS',
          label: 'Predictive Analytics',
          readinessPct: 90,
          orchestrationReady: true,
          routeCount: 3,
          primaryUseCase: 'Forward-looking signal packaging for key business metrics',
          nextFocus: 'Broaden scenario-driven insight views.',
        },
      ],
    });

    expect(preview.status).toBe('READY');
  });

  it('blocks a command center capability when orchestration is not ready', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 3,
      dashboardCoveragePct: 56,
      orchestrationCoveragePct: 44,
      narrativeCoveragePct: 49,
      capabilities: [
        {
          key: 'AI_CHAT',
          label: 'AI Chat',
          readinessPct: 74,
          orchestrationReady: false,
          routeCount: 3,
          primaryUseCase: 'Conversational entry point for cross-domain questions',
          nextFocus: 'Stabilize prompt routing and fallback behavior.',
        },
      ],
    });

    expect(preview.capabilities[0]?.status).toBe('BLOCKED');
    expect(preview.status).toBe('LIMITED');
  });
});
