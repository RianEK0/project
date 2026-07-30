import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { leaveRequestStatuses, leaveTypes } from '@nova/shared-types';

import { LeaveBalanceService } from './leave-balance.service';

@ApiTags('Leave Requests')
@Controller({
  path: 'leave-requests',
  version: '1',
})
export class LeaveRequestsController {
  constructor(private readonly leaveBalanceService: LeaveBalanceService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: leaveRequestStatuses,
      leaveTypes,
      approvalLanes: ['Direct Manager', 'HR Validation', 'Payroll Awareness'],
    };
  }

  @Get('balance-preview')
  getBalancePreview() {
    return this.leaveBalanceService.previewBalance({
      annualEntitlementDays: 12,
      carryForwardDays: 2,
      takenDays: 4,
      pendingDays: 2,
      requestedDays: 3,
    });
  }
}
