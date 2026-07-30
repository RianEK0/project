import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  supportTicketCategories,
  supportTicketChannels,
  supportTicketPriorities,
  supportTicketStatuses,
} from '@nova/shared-types';

import { SupportTicketWorkflowService } from './support-ticket-workflow.service';

@ApiTags('Support Tickets')
@Controller({
  path: 'support-tickets',
  version: '1',
})
export class SupportTicketsController {
  constructor(private readonly supportTicketWorkflowService: SupportTicketWorkflowService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: supportTicketStatuses,
      priorities: supportTicketPriorities,
      channels: supportTicketChannels,
      categories: supportTicketCategories,
    };
  }

  @Get('metadata')
  getMetadata() {
    return {
      transitions: this.supportTicketWorkflowService.getTransitionMatrix(),
      customerWritableStatuses: this.supportTicketWorkflowService.getCustomerWritableStatuses(),
      closableStatuses: this.supportTicketWorkflowService.getClosableStatuses(),
    };
  }
}
