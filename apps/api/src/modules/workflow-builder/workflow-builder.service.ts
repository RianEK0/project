import { HttpStatus, Injectable } from '@nestjs/common';
import {
  selfServeBuilderStatuses,
  workflowBuilderEventKeys,
  workflowBuilderExecutionModes,
  workflowBuilderStepTypes,
  type SelfServeBuilderStatus,
  type WorkflowBuilderEventKey,
  type WorkflowBuilderExecutionMode,
  type WorkflowBuilderStepType,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type WorkflowStepDraft = {
  id?: string;
  type?: string;
  label?: string;
};

type WorkflowBuilderPreviewInput = {
  workflowName?: string;
  eventKey?: string;
  executionMode?: string;
  steps?: WorkflowStepDraft[];
};

type WorkflowTemplateStep = {
  label: string;
  type: WorkflowBuilderStepType;
};

type WorkflowPreviewStep = {
  order: number;
  label: string;
  type: WorkflowBuilderStepType;
  channel: string;
  expectedOutcome: string;
};

export type WorkflowBuilderFoundation = {
  items: unknown[];
  statuses: readonly SelfServeBuilderStatus[];
  eventKeys: readonly WorkflowBuilderEventKey[];
  stepTypes: readonly WorkflowBuilderStepType[];
  executionModes: readonly WorkflowBuilderExecutionMode[];
  deliveryTargets: string[];
  starterTemplate: {
    eventKey: WorkflowBuilderEventKey;
    steps: WorkflowTemplateStep[];
  };
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
  steps: WorkflowPreviewStep[];
};

const starterTemplate = {
  eventKey: 'PURCHASE_ORDER_APPROVED' as const,
  steps: [
    { label: 'Email supplier confirmation', type: 'EMAIL' as const },
    { label: 'WhatsApp buyer update', type: 'WHATSAPP' as const },
    { label: 'Slack finance broadcast', type: 'SLACK' as const },
    { label: 'Create invoice draft', type: 'CREATE_INVOICE' as const },
    { label: 'Generate invoice PDF', type: 'GENERATE_PDF' as const },
    { label: 'Upload packet to Drive', type: 'UPLOAD_DRIVE' as const },
    { label: 'Notify manager', type: 'NOTIFY_MANAGER' as const },
  ],
};

@Injectable()
export class WorkflowBuilderService {
  getFoundation(): WorkflowBuilderFoundation {
    return {
      items: [],
      statuses: selfServeBuilderStatuses,
      eventKeys: workflowBuilderEventKeys,
      stepTypes: workflowBuilderStepTypes,
      executionModes: workflowBuilderExecutionModes,
      deliveryTargets: ['Email', 'WhatsApp', 'Slack', 'Google Drive', 'Manager Inbox'],
      starterTemplate,
    };
  }

  preview(input: WorkflowBuilderPreviewInput): WorkflowBuilderPreview {
    const workflowName = input.workflowName?.trim();

    if (!workflowName) {
      throw new AppException(
        ERROR_CODES.WORKFLOW_BUILDER_INPUT_INVALID,
        'Workflow name is required for composition preview.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const eventKey = this.resolveEventKey(input.eventKey);
    const executionMode = this.resolveExecutionMode(input.executionMode);
    const steps = this.resolveSteps(input.steps);

    if (steps.length === 0) {
      throw new AppException(
        ERROR_CODES.WORKFLOW_BUILDER_INPUT_INVALID,
        'At least one workflow step must be placed after the trigger.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      workflowName,
      eventKey,
      executionMode,
      status: steps.length >= 4 ? 'READY' : 'REVIEW_NEEDED',
      stepCount: steps.length,
      estimatedDurationSeconds: steps.length * 18 + (executionMode === 'SEQUENTIAL' ? 24 : 12),
      nextSimulationAt: '2026-07-27T09:00:00+07:00',
      summary: `Workflow "${workflowName}" starts from ${this.describeEvent(eventKey)} and fans out into ${steps.length} drag-and-drop actions, making NovaERP automation feel closer to an enterprise n8n lane.`,
      generatedArtifacts: this.buildArtifacts(steps),
      notifications: this.buildNotifications(steps),
      riskChecks: [
        'External channels should confirm credential readiness before publish.',
        'Finance artifact creation must remain tenant-scoped and approval-aware.',
        'Drive uploads should inherit document retention policy from the platform workspace.',
      ],
      steps,
    };
  }

  private resolveEventKey(eventKey?: string): WorkflowBuilderEventKey {
    if (!eventKey) {
      return 'PURCHASE_ORDER_APPROVED';
    }

    if (!workflowBuilderEventKeys.includes(eventKey as WorkflowBuilderEventKey)) {
      throw new AppException(
        ERROR_CODES.WORKFLOW_BUILDER_INPUT_INVALID,
        `Unsupported workflow event: ${eventKey}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return eventKey as WorkflowBuilderEventKey;
  }

  private resolveExecutionMode(executionMode?: string): WorkflowBuilderExecutionMode {
    if (!executionMode) {
      return 'SEQUENTIAL';
    }

    if (!workflowBuilderExecutionModes.includes(executionMode as WorkflowBuilderExecutionMode)) {
      throw new AppException(
        ERROR_CODES.WORKFLOW_BUILDER_INPUT_INVALID,
        `Unsupported workflow execution mode: ${executionMode}.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return executionMode as WorkflowBuilderExecutionMode;
  }

  private resolveSteps(steps?: WorkflowStepDraft[]): WorkflowPreviewStep[] {
    return (steps ?? [])
      .filter((step): step is Required<WorkflowStepDraft> => {
        return Boolean(step.id?.trim() && step.type?.trim() && step.label?.trim());
      })
      .slice(0, 12)
      .map((step, index) => {
        if (!workflowBuilderStepTypes.includes(step.type as WorkflowBuilderStepType)) {
          throw new AppException(
            ERROR_CODES.WORKFLOW_BUILDER_INPUT_INVALID,
            `Unsupported workflow step type: ${step.type}.`,
            HttpStatus.BAD_REQUEST,
          );
        }

        const type = step.type as WorkflowBuilderStepType;

        return {
          order: index + 1,
          label: step.label.trim(),
          type,
          channel: this.resolveChannel(type),
          expectedOutcome: this.resolveOutcome(type),
        };
      });
  }

  private describeEvent(eventKey: WorkflowBuilderEventKey) {
    switch (eventKey) {
      case 'PURCHASE_ORDER_APPROVED':
        return 'an approved purchase order event';
      case 'PURCHASE_REQUEST_APPROVED':
        return 'an approved purchase request event';
      case 'INVOICE_OVERDUE':
        return 'an overdue invoice event';
      case 'STOCK_BELOW_THRESHOLD':
        return 'a stock-below-threshold alert';
      case 'CONTRACT_EXPIRING':
        return 'a contract-expiring signal';
    }
  }

  private resolveChannel(type: WorkflowBuilderStepType) {
    switch (type) {
      case 'EMAIL':
        return 'Email';
      case 'WHATSAPP':
        return 'WhatsApp';
      case 'SLACK':
        return 'Slack';
      case 'UPLOAD_DRIVE':
        return 'Google Drive';
      case 'NOTIFY_MANAGER':
        return 'Manager Inbox';
      case 'WEBHOOK':
        return 'Webhook';
      default:
        return 'Internal NovaERP';
    }
  }

  private resolveOutcome(type: WorkflowBuilderStepType) {
    switch (type) {
      case 'EMAIL':
        return 'Send structured approval or handoff email.';
      case 'WHATSAPP':
        return 'Push conversational operational update.';
      case 'SLACK':
        return 'Broadcast workflow milestone to the selected channel.';
      case 'CREATE_INVOICE':
        return 'Create invoice draft for downstream finance review.';
      case 'GENERATE_PDF':
        return 'Generate document packet in PDF format.';
      case 'UPLOAD_DRIVE':
        return 'Upload generated packet into governed cloud storage.';
      case 'NOTIFY_MANAGER':
        return 'Notify the responsible manager with status context.';
      case 'CREATE_TASK':
        return 'Create an internal follow-up task.';
      case 'WEBHOOK':
        return 'Call an external integration endpoint.';
    }
  }

  private buildArtifacts(steps: WorkflowPreviewStep[]) {
    const artifacts = ['Workflow execution log'];

    if (steps.some((step) => step.type === 'CREATE_INVOICE')) {
      artifacts.push('Invoice draft');
    }
    if (steps.some((step) => step.type === 'GENERATE_PDF')) {
      artifacts.push('PDF document packet');
    }
    if (steps.some((step) => step.type === 'UPLOAD_DRIVE')) {
      artifacts.push('Drive upload task');
    }

    return artifacts;
  }

  private buildNotifications(steps: WorkflowPreviewStep[]) {
    return steps
      .filter((step) => ['EMAIL', 'WHATSAPP', 'SLACK', 'NOTIFY_MANAGER'].includes(step.type))
      .map((step) => `${step.channel}: ${step.label}`);
  }
}
