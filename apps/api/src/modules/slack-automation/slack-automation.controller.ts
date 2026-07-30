import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { automationRunStatuses, automationTriggerTypes } from '@nova/shared-types';

@ApiTags('Slack Automation')
@Controller({
  path: 'slack-automation',
  version: '1',
})
export class SlackAutomationController {
  @Get()
  listFoundation() {
    return {
      items: [],
      channel: 'SLACK',
      runStatuses: automationRunStatuses,
      triggerTypes: automationTriggerTypes,
      deliveryFormats: ['Channel post', 'Direct message', 'Thread reply'],
    };
  }
}
