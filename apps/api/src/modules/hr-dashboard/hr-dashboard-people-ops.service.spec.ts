import { describe, expect, it } from 'vitest';

import { HrDashboardPeopleOpsService } from './hr-dashboard-people-ops.service';

describe('HrDashboardPeopleOpsService', () => {
  const service = new HrDashboardPeopleOpsService();

  it('keeps people operations healthy when attendance and training stay high', () => {
    const preview = service.previewPeopleOps({
      headcount: 180,
      attendanceRatePct: 97.2,
      openRecruitments: 10,
      overdueReviews: 6,
      trainingCompletionPct: 89,
    });

    expect(preview.overallSignal).toBe('HEALTHY');
    expect(preview.focusArea).toBe('People operations baseline');
  });

  it('flags attendance and review backlog deterioration', () => {
    const preview = service.previewPeopleOps({
      headcount: 120,
      attendanceRatePct: 90.8,
      openRecruitments: 18,
      overdueReviews: 20,
      trainingCompletionPct: 78,
    });

    expect(preview.overallSignal).toBe('AT_RISK');
    expect(preview.focusArea).toBe('Attendance stability');
  });
});
