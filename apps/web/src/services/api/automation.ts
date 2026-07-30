import type {
  ApprovalFlowStatus,
  ApprovalRequestStatus,
  AutomationActionType,
  AutomationChannelType,
  AutomationConditionOperator,
  AutomationRuleStatus,
  AutomationRunStatus,
  AutomationTriggerType,
  CronFrequency,
  ReminderChannel,
  ReminderStatus,
  RuleEngineActionType,
  RuleEngineEvaluationMode,
  RuleEngineFactType,
  RuleEngineOperator,
  SelfServeBuilderStatus,
  ApiSuccessResponse,
  WorkflowBuilderEventKey,
  WorkflowBuilderExecutionMode,
  WorkflowBuilderStepType,
} from '@nova/shared-types';

import { apiClient } from './client';

export type ApprovalFlowsFoundation = {
  items: unknown[];
  flowStatuses: ApprovalFlowStatus[];
  requestStatuses: ApprovalRequestStatus[];
  stepRoles: string[];
  escalationPolicies: string[];
};

export type ApprovalRoutePreview = {
  documentLabel: string;
  flowStatus: 'ACTIVE';
  requestStatus: 'PENDING';
  requiredApprovers: string[];
  matchedStepCount: number;
  escalationRequired: boolean;
  summary: string;
};

export type AutomationRulesFoundation = {
  items: unknown[];
  statuses: AutomationRuleStatus[];
  triggerTypes: AutomationTriggerType[];
  conditionOperators: AutomationConditionOperator[];
  actionTypes: AutomationActionType[];
};

export type AutomationRuleEvaluationPreview = {
  ruleName: string;
  status: 'ACTIVE';
  matchedConditions: number;
  totalConditions: number;
  shouldRun: boolean;
  queuedActions: string[];
};

export type AutomationTriggersFoundation = {
  items: unknown[];
  triggerTypes: AutomationTriggerType[];
  eventSources: string[];
  debounceModes: string[];
  deliveryGuarantees: string[];
};

export type AutomationConditionsFoundation = {
  items: unknown[];
  operators: AutomationConditionOperator[];
  valueTypes: string[];
  compositionModes: string[];
  filterScopes: string[];
};

export type AutomationActionsFoundation = {
  items: unknown[];
  actionTypes: AutomationActionType[];
  executionModes: string[];
  sideEffects: string[];
};

export type AutomationRemindersFoundation = {
  items: unknown[];
  channels: ReminderChannel[];
  reminderStatuses: ReminderStatus[];
  runStatuses: AutomationRunStatus[];
  cadences: string[];
};

export type AutomationWebhooksFoundation = {
  items: unknown[];
  channels: AutomationChannelType[];
  runStatuses: AutomationRunStatus[];
  authModes: string[];
  retryStrategies: string[];
};

export type WebhookDeliveryPreview = {
  endpointName: string;
  retryStrategy: 'LINEAR' | 'EXPONENTIAL';
  retryScheduleMinutes: number[];
  totalRetryWindowMinutes: number;
};

export type ChannelAutomationFoundation = {
  items: unknown[];
  channel: AutomationChannelType;
  runStatuses: AutomationRunStatus[];
  triggerTypes: AutomationTriggerType[];
  templateFamilies?: string[];
  deliveryFormats?: string[];
};

export type CronJobsFoundation = {
  items: unknown[];
  frequencies: CronFrequency[];
  runStatuses: AutomationRunStatus[];
  timezones: string[];
};

export type CronSchedulePreview = {
  frequency: CronFrequency;
  cadenceSummary: string;
  nextRuns: string[];
};

export type WorkflowBuilderTemplateStep = {
  label: string;
  type: WorkflowBuilderStepType;
};

export type WorkflowBuilderFoundation = {
  items: unknown[];
  statuses: SelfServeBuilderStatus[];
  eventKeys: WorkflowBuilderEventKey[];
  stepTypes: WorkflowBuilderStepType[];
  executionModes: WorkflowBuilderExecutionMode[];
  deliveryTargets: string[];
  starterTemplate: {
    eventKey: WorkflowBuilderEventKey;
    steps: WorkflowBuilderTemplateStep[];
  };
};

export type WorkflowBuilderStepPreview = {
  order: number;
  label: string;
  type: WorkflowBuilderStepType;
  channel: string;
  expectedOutcome: string;
};

export type WorkflowBuilderPreview = {
  workflowName: string;
  eventKey: WorkflowBuilderEventKey;
  executionMode: WorkflowBuilderExecutionMode;
  status: SelfServeBuilderStatus;
  stepCount: number;
  estimatedDurationSeconds: number;
  nextSimulationAt: string;
  summary: string;
  generatedArtifacts: string[];
  notifications: string[];
  riskChecks: string[];
  steps: WorkflowBuilderStepPreview[];
};

export type WorkflowBuilderPreviewRequest = {
  workflowName: string;
  eventKey: WorkflowBuilderEventKey;
  executionMode: WorkflowBuilderExecutionMode;
  steps: Array<{
    id: string;
    type: WorkflowBuilderStepType;
    label: string;
  }>;
};

export type RuleEngineTemplate = {
  name: string;
  factType: RuleEngineFactType;
  operator: RuleEngineOperator;
  threshold: number;
  actionType: RuleEngineActionType;
};

export type RuleEngineFoundation = {
  items: unknown[];
  statuses: SelfServeBuilderStatus[];
  factTypes: RuleEngineFactType[];
  operators: RuleEngineOperator[];
  actionTypes: RuleEngineActionType[];
  evaluationModes: RuleEngineEvaluationMode[];
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

export type RuleEnginePreviewRequest = {
  ruleName: string;
  factType: RuleEngineFactType;
  operator: RuleEngineOperator;
  threshold: number;
  actionType: RuleEngineActionType;
  evaluationMode: RuleEngineEvaluationMode;
  actionTarget?: string;
};

export type ApprovalFlowsFoundationResponse = ApiSuccessResponse<ApprovalFlowsFoundation>;
export type ApprovalRoutePreviewResponse = ApiSuccessResponse<ApprovalRoutePreview>;
export type AutomationRulesFoundationResponse = ApiSuccessResponse<AutomationRulesFoundation>;
export type AutomationRuleEvaluationPreviewResponse =
  ApiSuccessResponse<AutomationRuleEvaluationPreview>;
export type AutomationTriggersFoundationResponse = ApiSuccessResponse<AutomationTriggersFoundation>;
export type AutomationConditionsFoundationResponse =
  ApiSuccessResponse<AutomationConditionsFoundation>;
export type AutomationActionsFoundationResponse = ApiSuccessResponse<AutomationActionsFoundation>;
export type AutomationRemindersFoundationResponse =
  ApiSuccessResponse<AutomationRemindersFoundation>;
export type AutomationWebhooksFoundationResponse = ApiSuccessResponse<AutomationWebhooksFoundation>;
export type WebhookDeliveryPreviewResponse = ApiSuccessResponse<WebhookDeliveryPreview>;
export type ChannelAutomationFoundationResponse = ApiSuccessResponse<ChannelAutomationFoundation>;
export type CronJobsFoundationResponse = ApiSuccessResponse<CronJobsFoundation>;
export type CronSchedulePreviewResponse = ApiSuccessResponse<CronSchedulePreview>;
export type WorkflowBuilderFoundationResponse = ApiSuccessResponse<WorkflowBuilderFoundation>;
export type WorkflowBuilderPreviewResponse = ApiSuccessResponse<WorkflowBuilderPreview>;
export type RuleEngineFoundationResponse = ApiSuccessResponse<RuleEngineFoundation>;
export type RuleEnginePreviewResponse = ApiSuccessResponse<RuleEnginePreview>;

export const automationApi = {
  getApprovalFlows() {
    return apiClient.get<ApprovalFlowsFoundationResponse>('/approval-flows');
  },
  getApprovalRoutePreview() {
    return apiClient.get<ApprovalRoutePreviewResponse>('/approval-flows/route-preview');
  },
  getAutomationRules() {
    return apiClient.get<AutomationRulesFoundationResponse>('/automation-rules');
  },
  getAutomationRuleEvaluationPreview() {
    return apiClient.get<AutomationRuleEvaluationPreviewResponse>(
      '/automation-rules/evaluation-preview',
    );
  },
  getAutomationTriggers() {
    return apiClient.get<AutomationTriggersFoundationResponse>('/automation-triggers');
  },
  getAutomationConditions() {
    return apiClient.get<AutomationConditionsFoundationResponse>('/automation-conditions');
  },
  getAutomationActions() {
    return apiClient.get<AutomationActionsFoundationResponse>('/automation-actions');
  },
  getAutomationReminders() {
    return apiClient.get<AutomationRemindersFoundationResponse>('/automation-reminders');
  },
  getAutomationWebhooks() {
    return apiClient.get<AutomationWebhooksFoundationResponse>('/automation-webhooks');
  },
  getWebhookDeliveryPreview() {
    return apiClient.get<WebhookDeliveryPreviewResponse>('/automation-webhooks/delivery-preview');
  },
  getEmailAutomation() {
    return apiClient.get<ChannelAutomationFoundationResponse>('/email-automation');
  },
  getWhatsappAutomation() {
    return apiClient.get<ChannelAutomationFoundationResponse>('/whatsapp-automation');
  },
  getSlackAutomation() {
    return apiClient.get<ChannelAutomationFoundationResponse>('/slack-automation');
  },
  getDiscordAutomation() {
    return apiClient.get<ChannelAutomationFoundationResponse>('/discord-automation');
  },
  getCronJobs() {
    return apiClient.get<CronJobsFoundationResponse>('/cron-jobs');
  },
  getCronSchedulePreview() {
    return apiClient.get<CronSchedulePreviewResponse>('/cron-jobs/schedule-preview');
  },
  getWorkflowBuilder() {
    return apiClient.get<WorkflowBuilderFoundationResponse>('/workflow-builder');
  },
  previewWorkflowBuilder(body: WorkflowBuilderPreviewRequest) {
    return apiClient.post<WorkflowBuilderPreviewResponse>('/workflow-builder/preview', body);
  },
  getRuleEngine() {
    return apiClient.get<RuleEngineFoundationResponse>('/rule-engine');
  },
  previewRuleEngine(body: RuleEnginePreviewRequest) {
    return apiClient.post<RuleEnginePreviewResponse>('/rule-engine/preview', body);
  },
};
