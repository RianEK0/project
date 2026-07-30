import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PublicApiService } from './public-api.service';

type PublicApiPreviewBody = {
  programName?: string;
  protocol?: string;
  sdkLanguage?: string;
  domain?: string;
  webhookEvents?: string[];
};

@ApiTags('Public API')
@Controller({
  path: 'public-api',
  version: '1',
})
export class PublicApiController {
  constructor(private readonly publicApiService: PublicApiService) {}

  @Get()
  getFoundation() {
    return this.publicApiService.getFoundation();
  }

  @Post('access-preview')
  preview(@Body() body: PublicApiPreviewBody) {
    return this.publicApiService.preview(body);
  }
}
