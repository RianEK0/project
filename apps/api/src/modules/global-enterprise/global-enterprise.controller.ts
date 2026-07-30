import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GlobalEnterpriseService } from './global-enterprise.service';

type GlobalEnterprisePreviewBody = {
  programName?: string;
  deploymentModel?: string;
  topologyMode?: string;
  companyCount?: number;
  branchCount?: number;
  userCount?: number;
  unlimitedDimensions?: string[];
};

@ApiTags('Global Enterprise')
@Controller({
  path: 'global-enterprise',
  version: '1',
})
export class GlobalEnterpriseController {
  constructor(private readonly globalEnterpriseService: GlobalEnterpriseService) {}

  @Get()
  getFoundation() {
    return this.globalEnterpriseService.getFoundation();
  }

  @Post('preview')
  preview(@Body() body: GlobalEnterprisePreviewBody) {
    return this.globalEnterpriseService.preview(body);
  }
}
