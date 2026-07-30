import { HttpStatus, Injectable } from '@nestjs/common';
import {
  automationActionTypes,
  automationConditionOperators,
  automationRuleStatuses,
  type AutomationActionType,
  type AutomationConditionOperator,
  type AutomationRuleStatus,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type RuleCondition = {
  field: string;
  operator: string;
  value: boolean | number | string | string[];
};

type RuleAction = {
  actionType: string;
  target: string;
};

type RuleEvaluationInput = {
  ruleName: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  context: Record<string, boolean | number | string | string[]>;
};

export type AutomationRuleEvaluationPreview = {
  ruleName: string;
  status: Extract<AutomationRuleStatus, 'ACTIVE'>;
  matchedConditions: number;
  totalConditions: number;
  shouldRun: boolean;
  queuedActions: string[];
};

@Injectable()
export class AutomationRuleEvaluatorService {
  getStatuses(): AutomationRuleStatus[] {
    return [...automationRuleStatuses];
  }

  getOperators(): AutomationConditionOperator[] {
    return [...automationConditionOperators];
  }

  getActionTypes(): AutomationActionType[] {
    return [...automationActionTypes];
  }

  evaluateRule(input: RuleEvaluationInput): AutomationRuleEvaluationPreview {
    if (input.conditions.length === 0) {
      throw new AppException(
        ERROR_CODES.AUTOMATION_CONDITION_INVALID,
        'Automation rules require at least one condition.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const matchedConditions = input.conditions.filter((condition) =>
      this.evaluateCondition(condition, input.context),
    ).length;
    const shouldRun = matchedConditions === input.conditions.length;

    return {
      ruleName: input.ruleName,
      status: 'ACTIVE',
      matchedConditions,
      totalConditions: input.conditions.length,
      shouldRun,
      queuedActions: shouldRun ? input.actions.map((action) => this.formatAction(action)) : [],
    };
  }

  private evaluateCondition(
    condition: RuleCondition,
    context: Record<string, boolean | number | string | string[]>,
  ): boolean {
    if (!automationConditionOperators.includes(condition.operator as AutomationConditionOperator)) {
      throw new AppException(
        ERROR_CODES.AUTOMATION_CONDITION_INVALID,
        `Unsupported automation condition operator "${condition.operator}".`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const normalizedOperator = condition.operator as AutomationConditionOperator;
    const actualValue = context[condition.field];

    switch (normalizedOperator) {
      case 'EQUALS':
        return actualValue === condition.value;
      case 'NOT_EQUALS':
        return actualValue !== condition.value;
      case 'GREATER_THAN':
        return Number(actualValue) > Number(condition.value);
      case 'GREATER_THAN_OR_EQUAL':
        return Number(actualValue) >= Number(condition.value);
      case 'LESS_THAN':
        return Number(actualValue) < Number(condition.value);
      case 'LESS_THAN_OR_EQUAL':
        return Number(actualValue) <= Number(condition.value);
      case 'CONTAINS':
        if (Array.isArray(actualValue)) {
          return actualValue.includes(String(condition.value));
        }

        return String(actualValue ?? '').includes(String(condition.value));
      case 'IN':
        return Array.isArray(condition.value)
          ? condition.value.map(String).includes(String(actualValue))
          : false;
    }

    throw new AppException(
      ERROR_CODES.AUTOMATION_CONDITION_INVALID,
      `Unsupported automation condition operator "${condition.operator}".`,
      HttpStatus.BAD_REQUEST,
    );
  }

  private formatAction(action: RuleAction): string {
    if (!automationActionTypes.includes(action.actionType as AutomationActionType)) {
      throw new AppException(
        ERROR_CODES.AUTOMATION_ACTION_UNSUPPORTED,
        `Unsupported automation action "${action.actionType}".`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const normalizedActionType = action.actionType as AutomationActionType;

    return `${normalizedActionType} -> ${action.target}`;
  }
}
