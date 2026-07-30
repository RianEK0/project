import { Module } from '@nestjs/common';

import { AttendanceController } from './attendance.controller';
import { AttendancePolicyService } from './attendance-policy.service';

@Module({
  controllers: [AttendanceController],
  providers: [AttendancePolicyService],
})
export class AttendanceModule {}
