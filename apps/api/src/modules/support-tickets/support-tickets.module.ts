import { Module } from '@nestjs/common';

import { SupportTicketWorkflowService } from './support-ticket-workflow.service';
import { SupportTicketsController } from './support-tickets.controller';

@Module({
  controllers: [SupportTicketsController],
  providers: [SupportTicketWorkflowService],
})
export class SupportTicketsModule {}
