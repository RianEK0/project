import { Injectable } from '@nestjs/common';
import {
  type DashboardAudience,
  type DashboardSignalTone,
  type DashboardTimeWindow,
} from '@nova/shared-types';

import {
  assertDashboardMetricMin,
  assertDashboardMetricRange,
  roundDashboardMetric,
  selectDashboardSignal,
  toDashboardPercent,
} from '../../common/utils/dashboard-preview.utils';

export type HrDashboardPeopleOpsInput = {
  headcount: number;
  attendanceRatePct: number;
  openRecruitments: number;
  overdueReviews: number;
  trainingCompletionPct: number;
};

export type HrDashboardPeopleOps = {
  audience: Extract<DashboardAudience, 'HR'>;
  window: Extract<DashboardTimeWindow, 'THIS_MONTH'>;
  overallSignal: DashboardSignalTone;
  attendanceRatePct: number;
  reviewBacklogPct: number;
  recruitingLoadPct: number;
  trainingCompletionPct: number;
  focusArea: string;
  summary: string;
};

@Injectable()
export class HrDashboardPeopleOpsService {
  previewPeopleOps(input: HrDashboardPeopleOpsInput): HrDashboardPeopleOps {
    assertDashboardMetricMin('Headcount', input.headcount, 1);
    assertDashboardMetricRange('Attendance rate percentage', input.attendanceRatePct, 0, 100);
    assertDashboardMetricMin('Open recruitments', input.openRecruitments);
    assertDashboardMetricMin('Overdue reviews', input.overdueReviews);
    assertDashboardMetricRange(
      'Training completion percentage',
      input.trainingCompletionPct,
      0,
      100,
    );

    const reviewBacklogPct = toDashboardPercent(input.overdueReviews, input.headcount);
    const recruitingLoadPct = toDashboardPercent(input.openRecruitments, input.headcount);

    const attendanceTone =
      input.attendanceRatePct < 92 ? 'AT_RISK' : input.attendanceRatePct < 96 ? 'WATCH' : 'HEALTHY';
    const reviewTone =
      reviewBacklogPct > 12 ? 'AT_RISK' : reviewBacklogPct > 6 ? 'WATCH' : 'HEALTHY';
    const recruitingTone =
      recruitingLoadPct > 15 ? 'AT_RISK' : recruitingLoadPct > 8 ? 'WATCH' : 'HEALTHY';
    const trainingTone =
      input.trainingCompletionPct < 70
        ? 'AT_RISK'
        : input.trainingCompletionPct < 85
          ? 'WATCH'
          : 'HEALTHY';

    const overallSignal = selectDashboardSignal(
      attendanceTone,
      reviewTone,
      recruitingTone,
      trainingTone,
    );
    const focusArea = this.resolveFocusArea({
      attendanceTone,
      reviewTone,
      recruitingTone,
      trainingTone,
    });

    return {
      audience: 'HR',
      window: 'THIS_MONTH',
      overallSignal,
      attendanceRatePct: roundDashboardMetric(input.attendanceRatePct),
      reviewBacklogPct: roundDashboardMetric(reviewBacklogPct),
      recruitingLoadPct: roundDashboardMetric(recruitingLoadPct),
      trainingCompletionPct: roundDashboardMetric(input.trainingCompletionPct),
      focusArea,
      summary: this.buildSummary(overallSignal, focusArea),
    };
  }

  private resolveFocusArea(input: {
    attendanceTone: DashboardSignalTone;
    reviewTone: DashboardSignalTone;
    recruitingTone: DashboardSignalTone;
    trainingTone: DashboardSignalTone;
  }): string {
    if (input.attendanceTone === 'AT_RISK') {
      return 'Attendance stability';
    }
    if (input.reviewTone === 'AT_RISK') {
      return 'Performance review backlog';
    }
    if (input.trainingTone === 'AT_RISK') {
      return 'Training completion';
    }
    if (input.recruitingTone !== 'HEALTHY') {
      return 'Recruiting coverage';
    }

    return 'People operations baseline';
  }

  private buildSummary(signal: DashboardSignalTone, focusArea: string): string {
    switch (signal) {
      case 'CRITICAL':
        return `${focusArea} is blocking people operations capacity and requires immediate intervention.`;
      case 'AT_RISK':
        return `${focusArea} is slipping and should be escalated in the current HR cadence.`;
      case 'WATCH':
        return `${focusArea} should remain on the HR dashboard while broader people signals stay stable.`;
      case 'HEALTHY':
        return 'Attendance, recruitment, review cadence, and training signals remain within expected HR thresholds.';
    }
  }
}
