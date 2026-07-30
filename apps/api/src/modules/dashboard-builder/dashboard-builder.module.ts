import { Module } from '@nestjs/common';

import { DashboardBuilderController } from './dashboard-builder.controller';
import { DashboardBuilderService } from './dashboard-builder.service';

@Module({
  controllers: [DashboardBuilderController],
  providers: [DashboardBuilderService],
})
export class DashboardBuilderModule {}
