import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { DevopsPlatformService } from './devops-platform.service';

type DevopsPlatformPreviewBody = {
  programName?: string;
  deploymentTarget?: string;
  pipelineProvider?: string;
  environments?: string[];
  observabilityTools?: string[];
};

@ApiTags('DevOps Platform')
@Controller({
  path: 'devops-platform',
  version: '1',
})
export class DevopsPlatformController {
  constructor(private readonly devopsPlatformService: DevopsPlatformService) {}

  @Get()
  getFoundation() {
    return this.devopsPlatformService.getFoundation();
  }

  @Post('preview')
  preview(@Body() body: DevopsPlatformPreviewBody) {
    return this.devopsPlatformService.preview(body);
  }
}
