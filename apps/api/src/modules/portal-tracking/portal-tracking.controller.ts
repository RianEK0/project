import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PortalTrackingService } from './portal-tracking.service';

@ApiTags('Portal Tracking')
@Controller({
  path: 'portal-tracking',
  version: '1',
})
export class PortalTrackingController {
  constructor(private readonly portalTrackingService: PortalTrackingService) {}

  @Get()
  getTrackingOverview() {
    return {
      entityTypes: this.portalTrackingService.getEntityTypes(),
      statuses: this.portalTrackingService.getEventStatuses(),
      cards: this.portalTrackingService.getSummaryCards(),
    };
  }

  @Get('timeline')
  getTimeline() {
    return {
      items: this.portalTrackingService.getTimeline(),
      exceptionItems: this.portalTrackingService.getExceptionEvents(),
    };
  }
}
