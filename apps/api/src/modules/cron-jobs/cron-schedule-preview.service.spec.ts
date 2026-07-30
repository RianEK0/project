import { describe, expect, it } from 'vitest';

import { CronSchedulePreviewService } from './cron-schedule-preview.service';

describe('CronSchedulePreviewService', () => {
  const service = new CronSchedulePreviewService();

  it('builds hourly schedules from an anchor time', () => {
    expect(
      service.previewSchedule({
        frequency: 'HOURLY',
        anchorAt: '2026-07-24T00:00:00.000Z',
      }),
    ).toMatchObject({
      nextRuns: [
        '2026-07-24T01:00:00.000Z',
        '2026-07-24T02:00:00.000Z',
        '2026-07-24T03:00:00.000Z',
      ],
    });
  });

  it('supports custom minute-based preview intervals', () => {
    expect(
      service.previewSchedule({
        frequency: 'CUSTOM',
        anchorAt: '2026-07-24T00:00:00.000Z',
        everyMinutes: 15,
        occurrences: 2,
      }),
    ).toMatchObject({
      nextRuns: ['2026-07-24T00:15:00.000Z', '2026-07-24T00:30:00.000Z'],
    });
  });

  it('rejects invalid cron preview input', () => {
    expect(() =>
      service.previewSchedule({
        frequency: 'CUSTOM',
        anchorAt: 'not-a-date',
        everyMinutes: 0,
      }),
    ).toThrowError(/valid anchor date/i);
  });
});
