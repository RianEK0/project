import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { EnterpriseCloudService } from './enterprise-cloud.service';

type EnterpriseCloudPreviewBody = {
  programName?: string;
  tenancyMode?: string;
  regionStrategy?: string;
  tenantCount?: number;
  regions?: string[];
  enabledLanes?: string[];
};

@ApiTags('Enterprise Cloud')
@Controller({
  path: 'enterprise-cloud',
  version: '1',
})
export class EnterpriseCloudController {
  constructor(private readonly enterpriseCloudService: EnterpriseCloudService) {}

  @Get()
  getFoundation() {
    return this.enterpriseCloudService.getFoundation();
  }

  @Post('preview')
  preview(@Body() body: EnterpriseCloudPreviewBody) {
    return this.enterpriseCloudService.preview(body);
  }
}
