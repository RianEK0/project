import { describe, expect, it } from 'vitest';

import { AiPerceptionService } from './ai-perception.service';

describe('AiPerceptionService', () => {
  const service = new AiPerceptionService();

  it('marks perception as ready when camera and safety coverage are strong', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 1,
      visualCoveragePct: 92,
      countingAccuracyPct: 90,
      safetyCompliancePct: 89,
      capabilities: [
        {
          key: 'AI_VISION',
          label: 'AI Vision',
          readinessPct: 91,
          visualReviewReady: true,
          routeCount: 3,
          primaryUseCase: 'Scan racks, warehouse aisles, and safety posture from a camera feed',
          nextFocus: 'Expand multi-angle cycle-count capture.',
        },
      ],
    });

    expect(preview.status).toBe('READY');
  });

  it('blocks a perception capability when visual review is missing', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 1,
      visualCoveragePct: 49,
      countingAccuracyPct: 46,
      safetyCompliancePct: 40,
      capabilities: [
        {
          key: 'AI_VISION',
          label: 'AI Vision',
          readinessPct: 72,
          visualReviewReady: false,
          routeCount: 3,
          primaryUseCase: 'Camera-based shelf and safety detection',
          nextFocus: 'Add supervisor verification and false-positive review.',
        },
      ],
    });

    expect(preview.capabilities[0]?.status).toBe('BLOCKED');
    expect(preview.status).toBe('LIMITED');
  });
});
