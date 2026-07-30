import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { portalNotificationChannels } from '@nova/shared-types';

@ApiTags('Portal Profile')
@Controller({
  path: 'portal-profile',
  version: '1',
})
export class PortalProfileController {
  @Get()
  getFoundation() {
    return {
      sections: ['CONTACT_PROFILE', 'BILLING_CONTACT', 'SECURITY', 'COMMUNICATION_PREFERENCES'],
      notificationChannels: portalNotificationChannels,
      availableActions: ['UPDATE_CONTACT', 'UPDATE_PASSWORD', 'UPDATE_PREFERENCES'],
    };
  }
}
