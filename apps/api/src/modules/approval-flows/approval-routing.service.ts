import { HttpStatus, Injectable } from '@nestjs/common';
import {
  approvalFlowStatuses,
  approvalRequestStatuses,
  type ApprovalFlowStatus,
  type ApprovalRequestStatus,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type ApprovalStep = {
  sequence: number;
  approverRole: string;
  minAmount?: number;
  departmentScope?: string;
};

type ApprovalRouteInput = {
  documentLabel: string;
  amount: number;
  requesterDepartment: string;
  steps: ApprovalStep[];
};

export type ApprovalRoutePreview = {
  documentLabel: string;
  flowStatus: Extract<ApprovalFlowStatus, 'ACTIVE'>;
  requestStatus: Extract<ApprovalRequestStatus, 'PENDING'>;
  requiredApprovers: string[];
  matchedStepCount: number;
  escalationRequired: boolean;
  summary: string;
};

@Injectable()
export class ApprovalRoutingService {
  getFlowStatuses(): ApprovalFlowStatus[] {
    return [...approvalFlowStatuses];
  }

  getRequestStatuses(): ApprovalRequestStatus[] {
    return [...approvalRequestStatuses];
  }

  previewRoute(input: ApprovalRouteInput): ApprovalRoutePreview {
    if (input.steps.length === 0) {
      throw new AppException(
        ERROR_CODES.APPROVAL_FLOW_NOT_FOUND,
        'Approval routing preview requires at least one configured step.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const sortedSteps = [...input.steps].sort((left, right) => left.sequence - right.sequence);
    const visitedSequences = new Set<number>();

    for (const step of sortedSteps) {
      if (step.sequence < 1 || visitedSequences.has(step.sequence)) {
        throw new AppException(
          ERROR_CODES.APPROVAL_STEP_SEQUENCE_INVALID,
          'Approval steps must use unique positive sequence numbers.',
          HttpStatus.BAD_REQUEST,
        );
      }

      visitedSequences.add(step.sequence);
    }

    const matchedSteps = sortedSteps.filter((step) => {
      const withinAmount = input.amount >= (step.minAmount ?? 0);
      const withinDepartment =
        !step.departmentScope ||
        step.departmentScope === 'ANY' ||
        step.departmentScope === input.requesterDepartment;

      return withinAmount && withinDepartment;
    });

    const requiredApprovers = (
      matchedSteps.length > 0 ? matchedSteps : sortedSteps.slice(0, 1)
    ).map((step) => step.approverRole);
    const escalationRequired = input.amount >= 100_000 || requiredApprovers.length >= 3;

    return {
      documentLabel: input.documentLabel,
      flowStatus: 'ACTIVE',
      requestStatus: 'PENDING',
      requiredApprovers,
      matchedStepCount: requiredApprovers.length,
      escalationRequired,
      summary: `${input.documentLabel} with amount ${input.amount} routes through ${requiredApprovers.join(', ')}.`,
    };
  }
}
