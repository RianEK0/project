import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { NovaOsService } from './nova-os.service';

type NovaOsPreviewBody = {
  programName?: string;
  deploymentMode?: string;
  collaborationMode?: string;
  studios?: string[];
  regions?: string[];
};

@ApiTags('NovaOS')
@Controller({
  path: 'nova-os',
  version: '1',
})
export class NovaOsController {
  constructor(private readonly novaOsService: NovaOsService) {}

  @Get()
  getFoundation() {
    return this.novaOsService.getFoundation();
  }

  @Post('preview')
  preview(@Body() body: NovaOsPreviewBody) {
    return this.novaOsService.preview(body);
  }
}
