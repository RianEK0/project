import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { EnterpriseSecurityService } from './enterprise-security.service';

type EnterpriseSecurityPreviewBody = {
  programName?: string;
  trustMode?: string;
  identityMode?: string;
  frameworks?: string[];
  enabledControls?: string[];
};

@ApiTags('Enterprise Security')
@Controller({
  path: 'enterprise-security',
  version: '1',
})
export class EnterpriseSecurityController {
  constructor(private readonly enterpriseSecurityService: EnterpriseSecurityService) {}

  @Get()
  getFoundation() {
    return this.enterpriseSecurityService.getFoundation();
  }

  @Post('preview')
  preview(@Body() body: EnterpriseSecurityPreviewBody) {
    return this.enterpriseSecurityService.preview(body);
  }
}
