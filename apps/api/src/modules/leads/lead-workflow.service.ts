import { HttpStatus, Injectable } from '@nestjs/common';
import { leadStatuses, type LeadStatus } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

const allowedTransitions: Record<LeadStatus, readonly LeadStatus[]> = {
  NEW: ['CONTACTED', 'NURTURING', 'LOST', 'ARCHIVED'],
  CONTACTED: ['QUALIFIED', 'NURTURING', 'LOST', 'ARCHIVED'],
  QUALIFIED: ['PROPOSAL_READY', 'CONVERTED', 'LOST'],
  NURTURING: ['CONTACTED', 'QUALIFIED', 'LOST', 'ARCHIVED'],
  PROPOSAL_READY: ['CONVERTED', 'LOST', 'ARCHIVED'],
  CONVERTED: [],
  LOST: [],
  ARCHIVED: [],
};

const convertibleStatuses = new Set<LeadStatus>(['QUALIFIED', 'PROPOSAL_READY']);

@Injectable()
export class LeadWorkflowService {
  getAllowedTransitions(status: LeadStatus): LeadStatus[] {
    return [...allowedTransitions[status]];
  }

  getTransitionMatrix(): Record<LeadStatus, LeadStatus[]> {
    const matrix = {} as Record<LeadStatus, LeadStatus[]>;

    for (const status of leadStatuses) {
      matrix[status] = [...allowedTransitions[status]];
    }

    return matrix;
  }

  getConvertibleStatuses(): LeadStatus[] {
    return [...convertibleStatuses];
  }

  canTransition(fromStatus: LeadStatus, toStatus: LeadStatus): boolean {
    if (fromStatus === toStatus) {
      return true;
    }

    return allowedTransitions[fromStatus].includes(toStatus);
  }

  canConvert(status: LeadStatus): boolean {
    return status === 'CONVERTED' || convertibleStatuses.has(status);
  }

  assertTransition(fromStatus: LeadStatus, toStatus: LeadStatus): void {
    if (!this.canTransition(fromStatus, toStatus)) {
      throw new AppException(
        ERROR_CODES.LEAD_INVALID_STATUS,
        `Lead transition from ${fromStatus} to ${toStatus} is not allowed.`,
        HttpStatus.CONFLICT,
      );
    }
  }

  assertConversionAllowed(status: LeadStatus): void {
    if (status === 'CONVERTED') {
      throw new AppException(
        ERROR_CODES.LEAD_ALREADY_CONVERTED,
        'Lead has already been converted.',
        HttpStatus.CONFLICT,
      );
    }

    if (!convertibleStatuses.has(status)) {
      throw new AppException(
        ERROR_CODES.LEAD_INVALID_STATUS,
        `Lead in status ${status} is not ready to convert.`,
        HttpStatus.CONFLICT,
      );
    }
  }
}
