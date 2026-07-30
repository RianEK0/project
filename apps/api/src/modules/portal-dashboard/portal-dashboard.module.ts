import { Module } from '@nestjs/common';

import { PortalDashboardController } from './portal-dashboard.controller';

@Module({
  controllers: [PortalDashboardController],
})
export class PortalDashboardModule {}
