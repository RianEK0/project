import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { portalNotificationStatuses } from '@nova/shared-types';

import { PortalNotificationCenterService } from './portal-notification-center.service';

@ApiTags('Portal Notifications')
@Controller({
  path: 'portal-notifications',
  version: '1',
})
export class PortalNotificationsController {
  constructor(private readonly portalNotificationCenterService: PortalNotificationCenterService) {}

  @Get()
  getInbox() {
    return {
      statuses: portalNotificationStatuses,
      summary: this.portalNotificationCenterService.getSummary(),
      items: this.portalNotificationCenterService.getInbox(),
    };
  }
}
