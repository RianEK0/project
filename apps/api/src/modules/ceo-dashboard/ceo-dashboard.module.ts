import { Module } from '@nestjs/common';

import { CeoDashboardController } from './ceo-dashboard.controller';
import { CeoDashboardBriefingService } from './ceo-dashboard-briefing.service';

@Module({
  controllers: [CeoDashboardController],
  providers: [CeoDashboardBriefingService],
})
export class CeoDashboardModule {}
