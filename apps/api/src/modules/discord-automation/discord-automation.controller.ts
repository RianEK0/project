import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { automationRunStatuses, automationTriggerTypes } from '@nova/shared-types';

@ApiTags('Discord Automation')
@Controller({
  path: 'discord-automation',
  version: '1',
})
export class DiscordAutomationController {
  @Get()
  listFoundation() {
    return {
      items: [],
      channel: 'DISCORD',
      runStatuses: automationRunStatuses,
      triggerTypes: automationTriggerTypes,
      deliveryFormats: ['Channel message', 'Role mention', 'Escalation alert'],
    };
  }
}
