import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { BiBuilderService } from './bi-builder.service';

type BiBuilderPreviewBody = {
  title?: string;
  layoutMode?: string;
  timeWindow?: string;
  widgets?: Array<{
    id?: string;
    type?: string;
    domain?: string;
    metric?: string;
  }>;
};

@ApiTags('BI Builder')
@Controller({
  path: 'bi-builder',
  version: '1',
})
export class BiBuilderController {
  constructor(private readonly biBuilderService: BiBuilderService) {}

  @Get()
  getFoundation() {
    return this.biBuilderService.getFoundation();
  }

  @Post('preview')
  preview(@Body() body: BiBuilderPreviewBody) {
    return this.biBuilderService.preview(body);
  }
}
