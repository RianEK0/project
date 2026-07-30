import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { DashboardBuilderService } from './dashboard-builder.service';

type DashboardBuilderPreviewBody = {
  dashboardName?: string;
  audience?: string;
  layoutMode?: string;
  refreshCadence?: string;
  widgets?: Array<{
    id?: string;
    type?: string;
    slot?: string;
    title?: string;
  }>;
};

@ApiTags('Dashboard Builder')
@Controller({
  path: 'dashboard-builder',
  version: '1',
})
export class DashboardBuilderController {
  constructor(private readonly dashboardBuilderService: DashboardBuilderService) {}

  @Get()
  getFoundation() {
    return this.dashboardBuilderService.getFoundation();
  }

  @Post('preview')
  preview(@Body() body: DashboardBuilderPreviewBody) {
    return this.dashboardBuilderService.preview(body);
  }
}
