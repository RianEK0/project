import { describe, expect, it } from 'vitest';

import { AnalyticsSemanticModelService } from './analytics-semantic-model.service';

describe('AnalyticsSemanticModelService', () => {
  const service = new AnalyticsSemanticModelService();

  it('marks semantic modeling as ready when fact and dimension readiness are strong', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 4,
      factCoveragePct: 91,
      dimensionCoveragePct: 90,
      cubeReadinessPct: 89,
      capabilities: [
        {
          key: 'FACT_TABLE',
          label: 'Fact Table',
          readinessPct: 91,
          semanticReady: true,
          routeCount: 2,
          primaryUseCase: 'Capture measurable business events with stable analytic grain',
          nextFocus: 'Expand conformed measures across domains.',
        },
        {
          key: 'DIMENSION',
          label: 'Dimension',
          readinessPct: 90,
          semanticReady: true,
          routeCount: 2,
          primaryUseCase: 'Normalize reusable descriptive attributes for BI slicing',
          nextFocus: 'Broaden slowly changing dimension coverage.',
        },
        {
          key: 'OLAP',
          label: 'OLAP',
          readinessPct: 89,
          semanticReady: true,
          routeCount: 2,
          primaryUseCase: 'Support multidimensional analysis and drill patterns',
          nextFocus: 'Refine aggregation rules and query paths.',
        },
        {
          key: 'CUBE',
          label: 'Cube',
          readinessPct: 90,
          semanticReady: true,
          routeCount: 2,
          primaryUseCase: 'Publish reusable analytic cubes for high-value business questions',
          nextFocus: 'Expand domain-ready cube templates.',
        },
      ],
    });

    expect(preview.status).toBe('READY');
  });

  it('blocks a semantic capability when the model contract is not ready', () => {
    const preview = service.previewReadiness({
      capabilitiesExpected: 4,
      factCoveragePct: 46,
      dimensionCoveragePct: 49,
      cubeReadinessPct: 41,
      capabilities: [
        {
          key: 'CUBE',
          label: 'Cube',
          readinessPct: 73,
          semanticReady: false,
          routeCount: 2,
          primaryUseCase: 'Reusable governed aggregation layer',
          nextFocus: 'Finalize cube grain and lineage rules.',
        },
      ],
    });

    expect(preview.capabilities[0]?.status).toBe('BLOCKED');
    expect(preview.status).toBe('LIMITED');
  });
});
