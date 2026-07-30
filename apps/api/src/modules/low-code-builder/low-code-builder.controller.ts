import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { LowCodeBuilderService } from './low-code-builder.service';

type LowCodeBuilderPreviewBody = {
  appName?: string;
  layoutMode?: string;
  surfaceTarget?: string;
  components?: Array<{
    id?: string;
    type?: string;
    zone?: string;
    label?: string;
  }>;
};

@ApiTags('Low Code Builder')
@Controller({
  path: 'low-code-builder',
  version: '1',
})
export class LowCodeBuilderController {
  constructor(private readonly lowCodeBuilderService: LowCodeBuilderService) {}

  @Get()
  getFoundation() {
    return this.lowCodeBuilderService.getFoundation();
  }

  @Post('preview')
  preview(@Body() body: LowCodeBuilderPreviewBody) {
    return this.lowCodeBuilderService.preview(body);
  }
}
