import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { automationRunStatuses, automationTriggerTypes } from '@nova/shared-types';

@ApiTags('WhatsApp Automation')
@Controller({
  path: 'whatsapp-automation',
  version: '1',
})
export class WhatsappAutomationController {
  @Get()
  listFoundation() {
    return {
      items: [],
      channel: 'WHATSAPP',
      runStatuses: automationRunStatuses,
      triggerTypes: automationTriggerTypes,
      templateFamilies: ['Approval ping', 'Reminder', 'Escalation'],
    };
  }
}
