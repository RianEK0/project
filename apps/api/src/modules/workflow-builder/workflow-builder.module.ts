import { Module } from '@nestjs/common';

import { WorkflowBuilderController } from './workflow-builder.controller';
import { WorkflowBuilderService } from './workflow-builder.service';

@Module({
  controllers: [WorkflowBuilderController],
  providers: [WorkflowBuilderService],
})
export class WorkflowBuilderModule {}
