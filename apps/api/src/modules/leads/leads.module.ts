import { Module } from '@nestjs/common';

import { LeadsController } from './leads.controller';
import { LeadWorkflowService } from './lead-workflow.service';

@Module({
  controllers: [LeadsController],
  providers: [LeadWorkflowService],
})
export class LeadsModule {}
