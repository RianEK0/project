import { Module } from '@nestjs/common';

import { DepreciationController } from './depreciation.controller';
import { DepreciationScheduleService } from './depreciation-schedule.service';

@Module({
  controllers: [DepreciationController],
  providers: [DepreciationScheduleService],
})
export class DepreciationModule {}
