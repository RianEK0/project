import { Module } from '@nestjs/common';

import { ExecutiveDashboardController } from './executive-dashboard.controller';
import { ExecutiveDashboardComposerService } from './executive-dashboard-composer.service';

@Module({
  controllers: [ExecutiveDashboardController],
  providers: [ExecutiveDashboardComposerService],
})
export class ExecutiveDashboardModule {}
