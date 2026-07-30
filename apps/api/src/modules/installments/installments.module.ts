import { Module } from '@nestjs/common';

import { InstallmentsController } from './installments.controller';
import { InstallmentPlanService } from './installment-plan.service';

@Module({
  controllers: [InstallmentsController],
  providers: [InstallmentPlanService],
})
export class InstallmentsModule {}
