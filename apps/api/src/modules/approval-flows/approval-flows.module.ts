import { Module } from '@nestjs/common';

import { ApprovalFlowsController } from './approval-flows.controller';
import { ApprovalRoutingService } from './approval-routing.service';

@Module({
  controllers: [ApprovalFlowsController],
  providers: [ApprovalRoutingService],
})
export class ApprovalFlowsModule {}
