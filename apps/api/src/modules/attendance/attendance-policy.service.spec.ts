import { describe, expect, it } from 'vitest';

import { AttendancePolicyService } from './attendance-policy.service';

describe('AttendancePolicyService', () => {
  const service = new AttendancePolicyService();

  it('classifies an on-time shift as present', () => {
    expect(
      service.previewEntry({
        scheduledStartAt: '2026-07-23T08:00:00.000Z',
        scheduledEndAt: '2026-07-23T17:00:00.000Z',
        checkInAt: '2026-07-23T08:03:00.000Z',
        checkOutAt: '2026-07-23T17:12:00.000Z',
        graceMinutes: 5,
      }),
    ).toMatchObject({
      status: 'PRESENT',
      lateMinutes: 0,
      overtimeMinutes: 9,
    });
  });

  it('marks arrivals beyond the grace period as late', () => {
    expect(
      service.previewEntry({
        scheduledStartAt: '2026-07-23T08:00:00.000Z',
        scheduledEndAt: '2026-07-23T17:00:00.000Z',
        checkInAt: '2026-07-23T08:14:00.000Z',
        checkOutAt: '2026-07-23T17:00:00.000Z',
        graceMinutes: 5,
      }),
    ).toMatchObject({
      status: 'LATE',
      lateMinutes: 9,
    });
  });

  it('rejects invalid attendance windows', () => {
    expect(() =>
      service.previewEntry({
        scheduledStartAt: '2026-07-23T17:00:00.000Z',
        scheduledEndAt: '2026-07-23T08:00:00.000Z',
        checkInAt: '2026-07-23T08:00:00.000Z',
        checkOutAt: '2026-07-23T17:00:00.000Z',
        graceMinutes: 5,
      }),
    ).toThrowError(/valid scheduled window/i);
  });
});
