import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { automationConditionOperators } from '@nova/shared-types';

@ApiTags('Automation Conditions')
@Controller({
  path: 'automation-conditions',
  version: '1',
})
export class AutomationConditionsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      operators: automationConditionOperators,
      valueTypes: ['String', 'Number', 'Boolean', 'List'],
      compositionModes: ['ALL', 'ANY'],
      filterScopes: ['Document field', 'Tenant setting', 'Computed signal'],
    };
  }
}
