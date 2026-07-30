import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { dashboardSignalTones } from '@nova/shared-types';

import { HrDashboardPeopleOpsService } from './hr-dashboard-people-ops.service';

@ApiTags('HR Dashboard')
@Controller({
  path: 'hr-dashboard',
  version: '1',
})
export class HrDashboardController {
  constructor(private readonly hrDashboardPeopleOpsService: HrDashboardPeopleOpsService) {}

  @Get()
  getDashboard() {
    return {
      audience: 'HR',
      supportedWindows: ['THIS_WEEK', 'THIS_MONTH', 'THIS_QUARTER'],
      signals: dashboardSignalTones,
      scorecards: [
        { id: 'attendance', label: 'Attendance', route: '/app/hr/attendance' },
        { id: 'recruitment', label: 'Recruitment', route: '/app/hr/recruitment' },
        { id: 'performance', label: 'Performance', route: '/app/hr/performance' },
        { id: 'training', label: 'Training', route: '/app/hr/training' },
      ],
      relatedDashboards: [
        { label: 'Executive Dashboard', route: '/app/dashboards/executive' },
        { label: 'Organization Chart', route: '/app/hr/organization-chart' },
      ],
    };
  }

  @Get('people-ops-preview')
  getPeopleOpsPreview() {
    return this.hrDashboardPeopleOpsService.previewPeopleOps({
      headcount: 164,
      attendanceRatePct: 95.1,
      openRecruitments: 14,
      overdueReviews: 9,
      trainingCompletionPct: 82.5,
    });
  }
}
