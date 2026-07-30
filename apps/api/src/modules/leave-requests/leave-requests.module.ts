import { Module } from '@nestjs/common';

import { LeaveBalanceService } from './leave-balance.service';
import { LeaveRequestsController } from './leave-requests.controller';

@Module({
  controllers: [LeaveRequestsController],
  providers: [LeaveBalanceService],
})
export class LeaveRequestsModule {}
