import { describe, expect, it } from 'vitest';

import { AvailabilityOverlapService } from './availability-overlap.service';

describe('AvailabilityOverlapService', () => {
  const service = new AvailabilityOverlapService();

  it('returns true when ranges overlap', () => {
    expect(
      service.hasOverlap(
        {
          startAt: new Date('2026-07-24T03:00:00.000Z'),
          endAt: new Date('2026-07-24T04:00:00.000Z'),
        },
        {
          startAt: new Date('2026-07-24T03:30:00.000Z'),
          endAt: new Date('2026-07-24T04:30:00.000Z'),
        },
      ),
    ).toBe(true);
  });

  it('returns false when ranges only touch at the edge', () => {
    expect(
      service.hasOverlap(
        {
          startAt: new Date('2026-07-24T03:00:00.000Z'),
          endAt: new Date('2026-07-24T04:00:00.000Z'),
        },
        {
          startAt: new Date('2026-07-24T04:00:00.000Z'),
          endAt: new Date('2026-07-24T05:00:00.000Z'),
        },
      ),
    ).toBe(false);
  });

  it('filters only conflicting ranges', () => {
    const overlaps = service.filterOverlaps(
      {
        startAt: new Date('2026-07-24T03:00:00.000Z'),
        endAt: new Date('2026-07-24T04:00:00.000Z'),
      },
      [
        {
          startAt: new Date('2026-07-24T01:00:00.000Z'),
          endAt: new Date('2026-07-24T02:00:00.000Z'),
        },
        {
          startAt: new Date('2026-07-24T03:15:00.000Z'),
          endAt: new Date('2026-07-24T03:45:00.000Z'),
        },
      ],
    );

    expect(overlaps).toHaveLength(1);
  });
});
