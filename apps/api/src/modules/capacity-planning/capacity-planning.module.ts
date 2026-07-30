import { Module } from '@nestjs/common';

import { CapacityPlanningController } from './capacity-planning.controller';
import { CapacityLoadService } from './capacity-load.service';

@Module({
  controllers: [CapacityPlanningController],
  providers: [CapacityLoadService],
})
export class CapacityPlanningModule {}
