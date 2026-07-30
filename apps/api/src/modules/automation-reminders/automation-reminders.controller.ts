import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { automationRunStatuses, reminderChannels, reminderStatuses } from '@nova/shared-types';

@ApiTags('Automation Reminders')
@Controller({
  path: 'automation-reminders',
  version: '1',
})
export class AutomationRemindersController {
  @Get()
  listFoundation() {
    return {
      items: [],
      channels: reminderChannels,
      reminderStatuses,
      runStatuses: automationRunStatuses,
      cadences: ['Before due', 'At due', 'After due', 'Escalation'],
    };
  }
}
