import { HttpStatus, Injectable } from '@nestjs/common';
import { salesOrderStatuses, type SalesOrderStatus } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

const allowedTransitions: Record<SalesOrderStatus, readonly SalesOrderStatus[]> = {
  DRAFT: ['PENDING_APPROVAL', 'CANCELLED'],
  PENDING_APPROVAL: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['ALLOCATED', 'CANCELLED'],
  ALLOCATED: ['PARTIALLY_DELIVERED', 'DELIVERED', 'CANCELLED'],
  PARTIALLY_DELIVERED: ['DELIVERED', 'PARTIALLY_INVOICED', 'CANCELLED'],
  DELIVERED: ['PARTIALLY_INVOICED', 'INVOICED', 'COMPLETED'],
  PARTIALLY_INVOICED: ['INVOICED', 'COMPLETED'],
  INVOICED: ['COMPLETED'],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
};

const invoiceReadyStatuses = new Set<SalesOrderStatus>([
  'PARTIALLY_DELIVERED',
  'DELIVERED',
  'PARTIALLY_INVOICED',
]);

@Injectable()
export class SalesOrderWorkflowService {
  getAllowedTransitions(status: SalesOrderStatus): SalesOrderStatus[] {
    return [...allowedTransitions[status]];
  }

  getTransitionMatrix(): Record<SalesOrderStatus, SalesOrderStatus[]> {
    const matrix = {} as Record<SalesOrderStatus, SalesOrderStatus[]>;

    for (const status of salesOrderStatuses) {
      matrix[status] = [...allowedTransitions[status]];
    }

    return matrix;
  }

  getInvoiceReadyStatuses(): SalesOrderStatus[] {
    return [...invoiceReadyStatuses];
  }

  canTransition(fromStatus: SalesOrderStatus, toStatus: SalesOrderStatus): boolean {
    if (fromStatus === toStatus) {
      return true;
    }

    return allowedTransitions[fromStatus].includes(toStatus);
  }

  canInvoice(status: SalesOrderStatus): boolean {
    return invoiceReadyStatuses.has(status);
  }

  assertTransition(fromStatus: SalesOrderStatus, toStatus: SalesOrderStatus): void {
    if (!this.canTransition(fromStatus, toStatus)) {
      throw new AppException(
        ERROR_CODES.SALES_ORDER_INVALID_STATUS,
        `Sales order transition from ${fromStatus} to ${toStatus} is not allowed.`,
        HttpStatus.CONFLICT,
      );
    }
  }

  assertInvoiceAllowed(status: SalesOrderStatus): void {
    if (status === 'INVOICED' || status === 'COMPLETED') {
      throw new AppException(
        ERROR_CODES.SALES_ORDER_ALREADY_INVOICED,
        `Sales order in status ${status} has already been invoiced.`,
        HttpStatus.CONFLICT,
      );
    }

    if (!invoiceReadyStatuses.has(status)) {
      throw new AppException(
        ERROR_CODES.SALES_ORDER_INVALID_STATUS,
        `Sales order in status ${status} is not ready for invoicing.`,
        HttpStatus.CONFLICT,
      );
    }
  }
}
