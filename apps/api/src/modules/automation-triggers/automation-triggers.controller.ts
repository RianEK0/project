import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { automationTriggerTypes } from '@nova/shared-types';

@ApiTags('Automation Triggers')
@Controller({
  path: 'automation-triggers',
  version: '1',
})
export class AutomationTriggersController {
  @Get()
  listFoundation() {
    return {
      items: [],
      triggerTypes: automationTriggerTypes,
      eventSources: ['Bookings', 'Procurement', 'Sales', 'Finance', 'HR', 'Manufacturing'],
      debounceModes: ['Immediate', 'Windowed', 'Batched'],
      deliveryGuarantees: ['At least once', 'Best effort preview'],
    };
  }
}
