import { describe, expect, it } from 'vitest';

import { AiAssistantsService } from './ai-assistants.service';

describe('AiAssistantsService', () => {
  const service = new AiAssistantsService();

  it('marks assistants as ready when voice and meeting flows are governed', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 2,
      voiceCoveragePct: 92,
      transcriptGovernancePct: 90,
      followUpCapturePct: 89,
      capabilities: [
        {
          key: 'AI_VOICE_ASSISTANT',
          label: 'AI Voice Assistant',
          readinessPct: 91,
          transcriptReady: true,
          routeCount: 3,
          primaryUseCase: 'Voice-driven query and operator guidance surface',
          nextFocus: 'Expand noise-aware mobile prompts.',
        },
        {
          key: 'AI_MEETING_SUMMARY',
          label: 'AI Meeting Summary',
          readinessPct: 90,
          transcriptReady: true,
          routeCount: 3,
          primaryUseCase: 'Summarize meetings into actions, owners, and recap notes',
          nextFocus: 'Add follow-up ticket and task mapping.',
        },
      ],
    });

    expect(preview.status).toBe('READY');
  });

  it('blocks an assistant capability when transcript readiness is missing', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 2,
      voiceCoveragePct: 48,
      transcriptGovernancePct: 41,
      followUpCapturePct: 44,
      capabilities: [
        {
          key: 'AI_MEETING_SUMMARY',
          label: 'AI Meeting Summary',
          readinessPct: 73,
          transcriptReady: false,
          routeCount: 3,
          primaryUseCase: 'Meeting recap and action extraction',
          nextFocus: 'Add transcript retention and review controls.',
        },
      ],
    });

    expect(preview.capabilities[0]?.status).toBe('BLOCKED');
    expect(preview.status).toBe('LIMITED');
  });
});
