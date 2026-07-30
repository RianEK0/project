import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { attendanceStatuses } from '@nova/shared-types';

import { AttendancePolicyService } from './attendance-policy.service';

@ApiTags('Attendance')
@Controller({
  path: 'attendance',
  version: '1',
})
export class AttendanceController {
  constructor(private readonly attendancePolicyService: AttendancePolicyService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: attendanceStatuses,
      captureMethods: ['Mobile', 'Web', 'Kiosk'],
      complianceRules: this.attendancePolicyService.getComplianceRules(),
    };
  }

  @Get('preview')
  getPreview() {
    return this.attendancePolicyService.previewEntry({
      scheduledStartAt: '2026-07-23T08:00:00.000Z',
      scheduledEndAt: '2026-07-23T17:00:00.000Z',
      checkInAt: '2026-07-23T08:06:00.000Z',
      checkOutAt: '2026-07-23T17:30:00.000Z',
      graceMinutes: 5,
    });
  }
}
