import { Module } from '@nestjs/common';

import { PortalTrackingController } from './portal-tracking.controller';
import { PortalTrackingService } from './portal-tracking.service';

@Module({
  controllers: [PortalTrackingController],
  providers: [PortalTrackingService],
})
export class PortalTrackingModule {}
