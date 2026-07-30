import { Module } from '@nestjs/common';

import { PortalNotificationCenterService } from './portal-notification-center.service';
import { PortalNotificationsController } from './portal-notifications.controller';

@Module({
  controllers: [PortalNotificationsController],
  providers: [PortalNotificationCenterService],
})
export class PortalNotificationsModule {}
