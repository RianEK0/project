import { HttpStatus, Injectable } from '@nestjs/common';
import { purchaseOrderStatuses, type PurchaseOrderStatus } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

const allowedTransitions: Record<PurchaseOrderStatus, readonly PurchaseOrderStatus[]> = {
  DRAFT: ['PENDING_APPROVAL', 'CANCELLED'],
  PENDING_APPROVAL: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['SENT', 'CANCELLED'],
  SENT: ['PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'],
  PARTIALLY_RECEIVED: ['RECEIVED', 'PARTIALLY_INVOICED', 'CANCELLED'],
  RECEIVED: ['PARTIALLY_INVOICED', 'INVOICED', 'CLOSED'],
  PARTIALLY_INVOICED: ['INVOICED', 'CLOSED'],
  INVOICED: ['CLOSED'],
  CLOSED: [],
  REJECTED: [],
  CANCELLED: [],
};

const invoicePreparationStatuses = new Set<PurchaseOrderStatus>([
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'PARTIALLY_INVOICED',
]);

@Injectable()
export class PurchaseOrderWorkflowService {
  getAllowedTransitions(status: PurchaseOrderStatus): PurchaseOrderStatus[] {
    return [...allowedTransitions[status]];
  }

  getTransitionMatrix(): Record<PurchaseOrderStatus, PurchaseOrderStatus[]> {
    const matrix = {} as Record<PurchaseOrderStatus, PurchaseOrderStatus[]>;

    for (const status of purchaseOrderStatuses) {
      matrix[status] = [...allowedTransitions[status]];
    }

    return matrix;
  }

  canTransition(fromStatus: PurchaseOrderStatus, toStatus: PurchaseOrderStatus): boolean {
    if (fromStatus === toStatus) {
      return true;
    }

    return allowedTransitions[fromStatus].includes(toStatus);
  }

  canPrepareInvoice(status: PurchaseOrderStatus): boolean {
    return invoicePreparationStatuses.has(status) || status === 'INVOICED';
  }

  assertTransition(fromStatus: PurchaseOrderStatus, toStatus: PurchaseOrderStatus): void {
    if (!this.canTransition(fromStatus, toStatus)) {
      throw new AppException(
        ERROR_CODES.PURCHASE_ORDER_NOT_FOUND,
        `Purchase order transition from ${fromStatus} to ${toStatus} is not allowed.`,
        HttpStatus.CONFLICT,
      );
    }
  }

  assertInvoicePreparationAllowed(status: PurchaseOrderStatus): void {
    if (!this.canPrepareInvoice(status)) {
      throw new AppException(
        ERROR_CODES.PURCHASE_ORDER_INVOICE_BLOCKED,
        `Purchase order in status ${status} is not ready for invoice preparation.`,
        HttpStatus.CONFLICT,
      );
    }
  }
}
