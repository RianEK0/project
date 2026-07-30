import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  supportTicketCategories,
  supportTicketChannels,
  supportTicketPriorities,
} from '@nova/shared-types';

@ApiTags('Portal Support')
@Controller({
  path: 'portal-support',
  version: '1',
})
export class PortalSupportController {
  @Get()
  getSupportCenter() {
    return {
      channels: supportTicketChannels,
      categories: supportTicketCategories,
      priorities: supportTicketPriorities,
      serviceWindow: {
        timezone: 'Asia/Jakarta',
        businessHours: 'Monday-Friday, 08:00-18:00',
      },
      responseTargets: [
        {
          priority: 'NORMAL',
          firstResponseTargetHours: 4,
        },
        {
          priority: 'URGENT',
          firstResponseTargetHours: 1,
        },
      ],
    };
  }
}
