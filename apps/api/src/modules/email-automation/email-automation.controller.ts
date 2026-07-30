import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { automationRunStatuses, automationTriggerTypes } from '@nova/shared-types';

@ApiTags('Email Automation')
@Controller({
  path: 'email-automation',
  version: '1',
})
export class EmailAutomationController {
  @Get()
  listFoundation() {
    return {
      items: [],
      channel: 'EMAIL',
      runStatuses: automationRunStatuses,
      triggerTypes: automationTriggerTypes,
      templateFamilies: ['Approval alert', 'Reminder', 'Digest', 'Escalation'],
    };
  }
}
