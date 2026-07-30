import { Module } from '@nestjs/common';

import { SalesPipelineController } from './sales-pipeline.controller';
import { SalesPipelineService } from './sales-pipeline.service';

@Module({
  controllers: [SalesPipelineController],
  providers: [SalesPipelineService],
})
export class SalesPipelineModule {}
