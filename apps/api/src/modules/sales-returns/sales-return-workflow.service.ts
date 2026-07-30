import { HttpStatus, Injectable } from '@nestjs/common';
import { salesReturnStatuses, type SalesReturnStatus } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

const allowedTransitions: Record<SalesReturnStatus, readonly SalesReturnStatus[]> = {
  REQUESTED: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['INBOUND_PENDING', 'CANCELLED'],
  INBOUND_PENDING: ['RECEIVED', 'CANCELLED'],
  RECEIVED: ['INSPECTED', 'CREDIT_ISSUED', 'REFUNDED', 'CANCELLED'],
  INSPECTED: ['CREDIT_ISSUED', 'REFUNDED', 'REJECTED', 'CANCELLED'],
  CREDIT_ISSUED: ['CLOSED'],
  REFUNDED: ['CLOSED'],
  CLOSED: [],
  REJECTED: [],
  CANCELLED: [],
};

const creditNoteEligibleStatuses = new Set<SalesReturnStatus>([
  'RECEIVED',
  'INSPECTED',
  'CREDIT_ISSUED',
  'REFUNDED',
  'CLOSED',
]);

@Injectable()
export class SalesReturnWorkflowService {
  getTransitionMatrix(): Record<SalesReturnStatus, SalesReturnStatus[]> {
    const matrix = {} as Record<SalesReturnStatus, SalesReturnStatus[]>;

    for (const status of salesReturnStatuses) {
      matrix[status] = [...allowedTransitions[status]];
    }

    return matrix;
  }

  getCreditNoteEligibleStatuses(): SalesReturnStatus[] {
    return [...creditNoteEligibleStatuses];
  }

  canTransition(fromStatus: SalesReturnStatus, toStatus: SalesReturnStatus): boolean {
    if (fromStatus === toStatus) {
      return true;
    }

    return allowedTransitions[fromStatus].includes(toStatus);
  }

  assertTransition(fromStatus: SalesReturnStatus, toStatus: SalesReturnStatus): void {
    if (!this.canTransition(fromStatus, toStatus)) {
      throw new AppException(
        ERROR_CODES.SALES_RETURN_NOT_FOUND,
        `Sales return transition from ${fromStatus} to ${toStatus} is not allowed.`,
        HttpStatus.CONFLICT,
      );
    }
  }

  assertCreditNoteAllowed(status: SalesReturnStatus): void {
    if (status === 'REQUESTED' || status === 'APPROVED' || status === 'INBOUND_PENDING') {
      throw new AppException(
        ERROR_CODES.SALES_RETURN_NOT_RECEIVED,
        `Sales return in status ${status} has not been received yet.`,
        HttpStatus.CONFLICT,
      );
    }

    if (!creditNoteEligibleStatuses.has(status)) {
      throw new AppException(
        ERROR_CODES.CREDIT_NOTE_NOT_READY,
        `Sales return in status ${status} is not ready for credit note issuance.`,
        HttpStatus.CONFLICT,
      );
    }
  }
}
