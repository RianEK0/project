import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { salesPipelineStages, salesPipelineStatuses } from '@nova/shared-types';

import { SalesPipelineService, type SalesPipelineSnapshot } from './sales-pipeline.service';

@ApiTags('Sales Pipeline')
@Controller({
  path: 'sales-pipeline',
  version: '1',
})
export class SalesPipelineController {
  constructor(private readonly salesPipelineService: SalesPipelineService) {}

  @Get()
  getFoundation() {
    return {
      stages: salesPipelineStages,
      statuses: salesPipelineStatuses,
      defaultProbabilities: this.salesPipelineService.getDefaultProbabilities(),
    };
  }

  @Post('preview')
  preview(@Body() body: { snapshot: SalesPipelineSnapshot[] }) {
    return this.salesPipelineService.summarize(body.snapshot ?? []);
  }
}
