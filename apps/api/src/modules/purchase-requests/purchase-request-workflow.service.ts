import { HttpStatus, Injectable } from '@nestjs/common';
import { purchaseRequestStatuses, type PurchaseRequestStatus } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

const allowedTransitions: Record<PurchaseRequestStatus, readonly PurchaseRequestStatus[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['PENDING_APPROVAL', 'CANCELLED'],
  PENDING_APPROVAL: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['SOURCING', 'CANCELLED'],
  REJECTED: [],
  SOURCING: ['PARTIALLY_ORDERED', 'ORDERED', 'CANCELLED'],
  PARTIALLY_ORDERED: ['ORDERED', 'CANCELLED'],
  ORDERED: [],
  CANCELLED: [],
};

const terminalStatuses = new Set<PurchaseRequestStatus>(['REJECTED', 'ORDERED', 'CANCELLED']);

@Injectable()
export class PurchaseRequestWorkflowService {
  getAllowedTransitions(status: PurchaseRequestStatus): PurchaseRequestStatus[] {
    return [...allowedTransitions[status]];
  }

  getTransitionMatrix(): Record<PurchaseRequestStatus, PurchaseRequestStatus[]> {
    const matrix = {} as Record<PurchaseRequestStatus, PurchaseRequestStatus[]>;

    for (const status of purchaseRequestStatuses) {
      matrix[status] = [...allowedTransitions[status]];
    }

    return matrix;
  }

  canTransition(fromStatus: PurchaseRequestStatus, toStatus: PurchaseRequestStatus): boolean {
    if (fromStatus === toStatus) {
      return true;
    }

    return allowedTransitions[fromStatus].includes(toStatus);
  }

  isTerminal(status: PurchaseRequestStatus): boolean {
    return terminalStatuses.has(status);
  }

  assertTransition(fromStatus: PurchaseRequestStatus, toStatus: PurchaseRequestStatus): void {
    if (!this.canTransition(fromStatus, toStatus)) {
      throw new AppException(
        ERROR_CODES.PURCHASE_REQUEST_INVALID_STATUS,
        `Purchase request transition from ${fromStatus} to ${toStatus} is not allowed.`,
        HttpStatus.CONFLICT,
      );
    }
  }
}
