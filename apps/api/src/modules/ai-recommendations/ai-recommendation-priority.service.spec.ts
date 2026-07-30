import { describe, expect, it } from 'vitest';

import { AiRecommendationPriorityService } from './ai-recommendation-priority.service';

describe('AiRecommendationPriorityService', () => {
  const service = new AiRecommendationPriorityService();

  it('ranks higher-impact actions first', () => {
    expect(
      service.rank([
        {
          title: 'Escalate blocked purchase orders',
          impactScore: 95,
          urgencyScore: 80,
          confidenceScore: 70,
        },
        {
          title: 'Refresh standard dashboard digest',
          impactScore: 50,
          urgencyScore: 40,
          confidenceScore: 90,
        },
      ]),
    ).toEqual([
      {
        title: 'Escalate blocked purchase orders',
        weightedScore: 85.5,
        priority: 'CRITICAL',
        ranking: 1,
      },
      {
        title: 'Refresh standard dashboard digest',
        weightedScore: 55,
        priority: 'MEDIUM',
        ranking: 2,
      },
    ]);
  });

  it('rejects out-of-range recommendation scores', () => {
    expect(() =>
      service.rank([
        {
          title: 'Broken input',
          impactScore: 120,
          urgencyScore: 50,
          confidenceScore: 40,
        },
      ]),
    ).toThrowError(/must stay within 0-100/i);
  });
});
