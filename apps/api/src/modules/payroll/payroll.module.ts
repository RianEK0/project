import { Module } from '@nestjs/common';

import { PayrollController } from './payroll.controller';
import { PayrollCycleService } from './payroll-cycle.service';

@Module({
  controllers: [PayrollController],
  providers: [PayrollCycleService],
})
export class PayrollModule {}
