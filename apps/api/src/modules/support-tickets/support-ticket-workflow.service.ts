import { HttpStatus, Injectable } from '@nestjs/common';
import { supportTicketStatuses, type SupportTicketStatus } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

const allowedTransitions: Record<SupportTicketStatus, readonly SupportTicketStatus[]> = {
  OPEN: ['ACKNOWLEDGED', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'],
  ACKNOWLEDGED: ['IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'],
  IN_PROGRESS: ['WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'],
  WAITING_FOR_CUSTOMER: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
};

const customerWritableStatuses = new Set<SupportTicketStatus>(['OPEN', 'WAITING_FOR_CUSTOMER']);
const closableStatuses = new Set<SupportTicketStatus>(['RESOLVED']);

@Injectable()
export class SupportTicketWorkflowService {
  getAllowedTransitions(status: SupportTicketStatus): SupportTicketStatus[] {
    return [...allowedTransitions[status]];
  }

  getTransitionMatrix(): Record<SupportTicketStatus, SupportTicketStatus[]> {
    const matrix = {} as Record<SupportTicketStatus, SupportTicketStatus[]>;

    for (const status of supportTicketStatuses) {
      matrix[status] = [...allowedTransitions[status]];
    }

    return matrix;
  }

  getCustomerWritableStatuses(): SupportTicketStatus[] {
    return [...customerWritableStatuses];
  }

  getClosableStatuses(): SupportTicketStatus[] {
    return [...closableStatuses];
  }

  canTransition(fromStatus: SupportTicketStatus, toStatus: SupportTicketStatus): boolean {
    if (fromStatus === toStatus) {
      return true;
    }

    return allowedTransitions[fromStatus].includes(toStatus);
  }

  canCustomerReply(status: SupportTicketStatus): boolean {
    return customerWritableStatuses.has(status);
  }

  assertTransition(fromStatus: SupportTicketStatus, toStatus: SupportTicketStatus): void {
    if (!this.canTransition(fromStatus, toStatus)) {
      throw new AppException(
        ERROR_CODES.SUPPORT_TICKET_INVALID_STATUS,
        `Support ticket transition from ${fromStatus} to ${toStatus} is not allowed.`,
        HttpStatus.CONFLICT,
      );
    }
  }

  assertClosable(status: SupportTicketStatus): void {
    if (!closableStatuses.has(status)) {
      throw new AppException(
        ERROR_CODES.SUPPORT_TICKET_INVALID_STATUS,
        `Support ticket in status ${status} cannot be closed yet.`,
        HttpStatus.CONFLICT,
      );
    }
  }
}
