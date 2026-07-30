import { HttpStatus, Injectable } from '@nestjs/common';
import {
  ruleEngineActionTypes,
  ruleEngineEvaluationModes,
  ruleEngineFactTypes,
  ruleEngineOperators,
  selfServeBuilderStatuses,
  type RuleEngineActionType,
  type RuleEngineEvaluationMode,
  type RuleEngineFactType,
  type RuleEngineOperator,
  type SelfServeBuilderStatus,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type RuleEnginePreviewInput = {
  ruleName?: string;
  factType?: string;
  operator?: string;
  threshold?: number;
  actionType?: string;
  evaluationMode?: string;
  actionTarget?: string;
};

type RuleEngineTemplate = {
  name: string;
  factType: RuleEngineFactType;
  operator: RuleEngineOperator;
  threshold: number;
  actionType: RuleEngineActionType;
};

export type RuleEngineFoundation = {
  items: unknown[];
  statuses: readonly SelfServeBuilderStatus[];
  factTypes: readonly RuleEngineFactType[];
  operators: readonly RuleEngineOperator[];
  actionTypes: readonly RuleEngineActionType[];
  evaluationModes: readonly RuleEngineEvaluationMode[];
  templates: RuleEngineTemplate[];
};

export type RuleEnginePreview = {
  ruleName: string;
  status: SelfServeBuilderStatus;
  factType: RuleEngineFactType;
  operator: RuleEngineOperator;
  threshold: number;
  actionType: RuleEngineActionType;
  evaluationMode: RuleEngineEvaluationMode;
  conditionSummary: string;
  actionSummary: string;
  matchedScenario: string;
  triggeredRecord: string;
  routingOutcome: string;
  nextEvaluationAt: string;
  safeguards: string[];
  auditTrail: string[];
};

@Injectable()
export class RuleEngineService {
  getFoundation(): RuleEngineFoundation {
    return {
      items: [],
      statuses: selfServeBuilderStatuses,
      factTypes: ruleEngineFactTypes,
      operators: ruleEngineOperators,
      actionTypes: ruleEngineActionTypes,
      evaluationModes: ruleEngineEvaluationModes,
      templates: [
        {
          name: 'Low Stock Auto PR',
          factType: 'STOCK_ON_HAND',
          operator: 'LESS_THAN',
          threshold: 10,
          actionType: 'CREATE_PURCHASE_REQUEST',
        },
        {
          name: 'High Invoice Director Approval',
          factType: 'INVOICE_TOTAL',
          operator: 'GREATER_THAN',
          threshold: 50000000,
          actionType: 'REQUIRE_DIRECTOR_APPROVAL',
        },
      ],
    };
  }

  preview(input: RuleEnginePreviewInput): RuleEnginePreview {
    const ruleName = input.ruleName?.trim();

    if (!ruleName) {
      throw new AppException(
        ERROR_CODES.RULE_ENGINE_INPUT_INVALID,
        'Rule name is required for business rule preview.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const factType = this.resolveFactType(input.factType);
    const operator = this.resolveOperator(input.operator);
    const actionType = this.resolveActionType(input.actionType);
    const evaluationMode = this.resolveEvaluationMode(input.evaluationMode);
    const threshold = this.resolveThreshold(input.threshold);

    return {
      ruleName,
      status: 'READY',
      factType,
      operator,
      threshold,
      actionType,
      evaluationMode,
      conditionSummary: this.buildConditionSummary(factType, operator, threshold),
      actionSummary: this.buildActionSummary(actionType, input.actionTarget),
      matchedScenario: this.buildMatchedScenario(factType, threshold),
      triggeredRecord: this.buildTriggeredRecord(actionType),
      routingOutcome: this.buildRoutingOutcome(actionType),
      nextEvaluationAt: '2026-07-27T08:30:00+07:00',
      safeguards: [
        'Rule evaluation should stay tenant-scoped and audit logged.',
        'Auto-created documents must remain draft until downstream review confirms the action.',
        'Threshold changes above financial approval bands should require admin review.',
      ],
      auditTrail: [
        'Condition evaluated against live operational fact',
        'Rule decision stored for audit replay',
        'Downstream action routed to the bounded context owner',
      ],
    };
  }

  private resolveFactType(factType?: string): RuleEngineFactType {
    if (!factType) {
      return 'STOCK_ON_HAND';
    }

    if (!ruleEngineFactTypes.includes(factType as RuleEngineFactType)) {
      throw new AppException(
        ERROR_CODES.RULE_ENGINE_INPUT_INVALID,
        `Unsupported rule fact type: ${factType}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return factType as RuleEngineFactType;
  }

  private resolveOperator(operator?: string): RuleEngineOperator {
    if (!operator) {
      return 'LESS_THAN';
    }

    if (!ruleEngineOperators.includes(operator as RuleEngineOperator)) {
      throw new AppException(
        ERROR_CODES.RULE_ENGINE_INPUT_INVALID,
        `Unsupported rule operator: ${operator}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return operator as RuleEngineOperator;
  }

  private resolveActionType(actionType?: string): RuleEngineActionType {
    if (!actionType) {
      return 'CREATE_PURCHASE_REQUEST';
    }

    if (!ruleEngineActionTypes.includes(actionType as RuleEngineActionType)) {
      throw new AppException(
        ERROR_CODES.RULE_ENGINE_INPUT_INVALID,
        `Unsupported rule action type: ${actionType}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return actionType as RuleEngineActionType;
  }

  private resolveEvaluationMode(evaluationMode?: string): RuleEngineEvaluationMode {
    if (!evaluationMode) {
      return 'REALTIME';
    }

    if (!ruleEngineEvaluationModes.includes(evaluationMode as RuleEngineEvaluationMode)) {
      throw new AppException(
        ERROR_CODES.RULE_ENGINE_INPUT_INVALID,
        `Unsupported rule evaluation mode: ${evaluationMode}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return evaluationMode as RuleEngineEvaluationMode;
  }

  private resolveThreshold(threshold?: number) {
    if (typeof threshold !== 'number' || Number.isNaN(threshold) || threshold <= 0) {
      throw new AppException(
        ERROR_CODES.RULE_ENGINE_INPUT_INVALID,
        'Rule threshold must be a positive number.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return threshold;
  }

  private buildConditionSummary(
    factType: RuleEngineFactType,
    operator: RuleEngineOperator,
    threshold: number,
  ) {
    return `${factType} ${operator} ${threshold}`;
  }

  private buildActionSummary(actionType: RuleEngineActionType, actionTarget?: string) {
    switch (actionType) {
      case 'CREATE_PURCHASE_REQUEST':
        return 'Create purchase request draft for procurement review.';
      case 'REQUIRE_DIRECTOR_APPROVAL':
        return `Route invoice to director approval${actionTarget ? ` (${actionTarget})` : ''}.`;
      case 'SEND_MANAGER_ALERT':
        return 'Send alert to the responsible manager.';
      case 'CREATE_TASK':
        return 'Create internal follow-up task.';
      case 'ESCALATE_TO_FINANCE':
        return 'Escalate the rule outcome to finance leadership.';
    }
  }

  private buildMatchedScenario(factType: RuleEngineFactType, threshold: number) {
    switch (factType) {
      case 'STOCK_ON_HAND':
        return `SKU FAST-001 in Warehouse Jakarta is at 7 units, below the configured threshold of ${threshold}.`;
      case 'INVOICE_TOTAL':
        return `Invoice INV-2026-00917 is valued at IDR 68,500,000, above the configured threshold of ${threshold}.`;
      case 'PURCHASE_REQUEST_TOTAL':
        return `Purchase request PR-2026-0042 has crossed the requested amount threshold of ${threshold}.`;
      case 'LEAD_TIME_DAYS':
        return `Supplier lead time has drifted to 19 days, violating the target threshold of ${threshold}.`;
      case 'PAYMENT_DELAY_DAYS':
        return `Payment delay has reached 14 days against the configured threshold of ${threshold}.`;
    }
  }

  private buildTriggeredRecord(actionType: RuleEngineActionType) {
    switch (actionType) {
      case 'CREATE_PURCHASE_REQUEST':
        return 'Purchase Request draft PR-DRAFT-2026-0727 queued.';
      case 'REQUIRE_DIRECTOR_APPROVAL':
        return 'Approval request APV-2026-0727-DIR queued for director review.';
      case 'SEND_MANAGER_ALERT':
        return 'Manager alert packet queued in notification center.';
      case 'CREATE_TASK':
        return 'Task draft created in the responsible work queue.';
      case 'ESCALATE_TO_FINANCE':
        return 'Finance escalation item queued for review.';
    }
  }

  private buildRoutingOutcome(actionType: RuleEngineActionType) {
    switch (actionType) {
      case 'CREATE_PURCHASE_REQUEST':
        return 'Procurement Planner receives the draft on Monday, July 27, 2026.';
      case 'REQUIRE_DIRECTOR_APPROVAL':
        return 'Route escalates Finance Manager -> Director on Monday, July 27, 2026.';
      case 'SEND_MANAGER_ALERT':
        return 'Manager notification is pushed into email and in-app inbox.';
      case 'CREATE_TASK':
        return 'Task is routed into the assigned operations backlog.';
      case 'ESCALATE_TO_FINANCE':
        return 'Finance leadership receives the case in the escalation queue.';
    }
  }
}
