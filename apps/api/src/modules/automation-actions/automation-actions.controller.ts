import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { automationActionTypes } from '@nova/shared-types';

@ApiTags('Automation Actions')
@Controller({
  path: 'automation-actions',
  version: '1',
})
export class AutomationActionsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      actionTypes: automationActionTypes,
      executionModes: ['Synchronous preview', 'Queued execution', 'Escalation handoff'],
      sideEffects: ['Approval creation', 'Notification delivery', 'Webhook call', 'Task creation'],
    };
  }
}
