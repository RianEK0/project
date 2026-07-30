import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { WorkflowBuilderService } from './workflow-builder.service';

type WorkflowBuilderPreviewBody = {
  workflowName?: string;
  eventKey?: string;
  executionMode?: string;
  steps?: Array<{
    id?: string;
    type?: string;
    label?: string;
  }>;
};

@ApiTags('Workflow Builder')
@Controller({
  path: 'workflow-builder',
  version: '1',
})
export class WorkflowBuilderController {
  constructor(private readonly workflowBuilderService: WorkflowBuilderService) {}

  @Get()
  getFoundation() {
    return this.workflowBuilderService.getFoundation();
  }

  @Post('preview')
  preview(@Body() body: WorkflowBuilderPreviewBody) {
    return this.workflowBuilderService.preview(body);
  }
}
