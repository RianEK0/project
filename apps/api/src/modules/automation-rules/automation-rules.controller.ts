import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { automationTriggerTypes } from '@nova/shared-types';

import { AutomationRuleEvaluatorService } from './automation-rule-evaluator.service';

@ApiTags('Automation Rules')
@Controller({
  path: 'automation-rules',
  version: '1',
})
export class AutomationRulesController {
  constructor(private readonly automationRuleEvaluatorService: AutomationRuleEvaluatorService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: this.automationRuleEvaluatorService.getStatuses(),
      triggerTypes: automationTriggerTypes,
      conditionOperators: this.automationRuleEvaluatorService.getOperators(),
      actionTypes: this.automationRuleEvaluatorService.getActionTypes(),
    };
  }

  @Get('evaluation-preview')
  getEvaluationPreview() {
    return this.automationRuleEvaluatorService.evaluateRule({
      ruleName: 'High-value approval alert',
      conditions: [
        { field: 'status', operator: 'EQUALS', value: 'PENDING_APPROVAL' },
        { field: 'amount', operator: 'GREATER_THAN', value: 100_000 },
      ],
      actions: [
        { actionType: 'SEND_SLACK', target: '#approvals' },
        { actionType: 'SEND_EMAIL', target: 'finance@novaerp.local' },
      ],
      context: {
        status: 'PENDING_APPROVAL',
        amount: 125_000,
      },
    });
  }
}
