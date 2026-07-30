import { describe, expect, it } from 'vitest';

import { AnalyticsRealtimeService } from './analytics-realtime.service';

describe('AnalyticsRealtimeService', () => {
  const service = new AnalyticsRealtimeService();

  it('marks realtime analytics as ready when stream and freshness coverage are strong', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 1,
      streamCoveragePct: 92,
      freshnessSlaPct: 90,
      alertCoveragePct: 89,
      capabilities: [
        {
          key: 'REALTIME_ANALYTICS',
          label: 'Realtime Analytics',
          readinessPct: 91,
          streamReady: true,
          routeCount: 3,
          primaryUseCase: 'Track low-latency operational KPIs and trigger timely intervention',
          nextFocus: 'Expand event lineage and operator alert presets.',
        },
      ],
    });

    expect(preview.status).toBe('READY');
  });

  it('blocks realtime analytics when the stream layer is not ready', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 1,
      streamCoveragePct: 42,
      freshnessSlaPct: 39,
      alertCoveragePct: 44,
      capabilities: [
        {
          key: 'REALTIME_ANALYTICS',
          label: 'Realtime Analytics',
          readinessPct: 74,
          streamReady: false,
          routeCount: 3,
          primaryUseCase: 'Low-latency BI and escalation support',
          nextFocus: 'Stabilize stream ingestion and freshness monitoring.',
        },
      ],
    });

    expect(preview.capabilities[0]?.status).toBe('BLOCKED');
    expect(preview.status).toBe('LIMITED');
  });
});
