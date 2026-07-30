import { describe, expect, it } from 'vitest';

import { CapacityLoadService } from './capacity-load.service';

describe('CapacityLoadService', () => {
  const service = new CapacityLoadService();

  it('marks balanced loads within effective capacity', () => {
    expect(
      service.previewLoad({
        workCenter: 'WC-ASSEMBLY-01',
        availableHours: 80,
        plannedHours: 72,
        overtimeBufferHours: 8,
      }),
    ).toMatchObject({
      status: 'BALANCED',
      effectiveCapacityHours: 88,
    });
  });

  it('marks heavily idle work centers as underutilized', () => {
    expect(
      service.previewLoad({
        workCenter: 'WC-PACK-02',
        availableHours: 80,
        plannedHours: 40,
        overtimeBufferHours: 0,
      }),
    ).toMatchObject({
      status: 'UNDERUTILIZED',
    });
  });

  it('blocks overloaded capacity plans', () => {
    expect(() =>
      service.assertCapacityAvailable({
        workCenter: 'WC-CNC-01',
        availableHours: 80,
        plannedHours: 95,
        overtimeBufferHours: 4,
      }),
    ).toThrowError(/exceeds effective available hours/i);
  });
});
