import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ReportBuilderService } from './report-builder.service';

type ReportBuilderPreviewBody = {
  reportName?: string;
  dataset?: string;
  joinType?: string;
  blocks?: Array<{
    id?: string;
    type?: string;
  }>;
};

@ApiTags('Report Builder')
@Controller({
  path: 'report-builder',
  version: '1',
})
export class ReportBuilderController {
  constructor(private readonly reportBuilderService: ReportBuilderService) {}

  @Get()
  getFoundation() {
    return this.reportBuilderService.getFoundation();
  }

  @Post('preview')
  preview(@Body() body: ReportBuilderPreviewBody) {
    return this.reportBuilderService.preview(body);
  }
}
