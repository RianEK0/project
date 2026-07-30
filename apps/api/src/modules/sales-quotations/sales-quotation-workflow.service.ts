import { HttpStatus, Injectable } from '@nestjs/common';
import { salesQuotationStatuses, type SalesQuotationStatus } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

const allowedTransitions: Record<SalesQuotationStatus, readonly SalesQuotationStatus[]> = {
  DRAFT: ['SENT', 'CANCELLED'],
  SENT: ['VIEWED', 'NEGOTIATING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'],
  VIEWED: ['NEGOTIATING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'],
  NEGOTIATING: ['ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'],
  ACCEPTED: ['CONVERTED', 'CANCELLED'],
  REJECTED: [],
  EXPIRED: [],
  CONVERTED: [],
  CANCELLED: [],
};

@Injectable()
export class SalesQuotationWorkflowService {
  getAllowedTransitions(status: SalesQuotationStatus): SalesQuotationStatus[] {
    return [...allowedTransitions[status]];
  }

  getTransitionMatrix(): Record<SalesQuotationStatus, SalesQuotationStatus[]> {
    const matrix = {} as Record<SalesQuotationStatus, SalesQuotationStatus[]>;

    for (const status of salesQuotationStatuses) {
      matrix[status] = [...allowedTransitions[status]];
    }

    return matrix;
  }

  canTransition(fromStatus: SalesQuotationStatus, toStatus: SalesQuotationStatus): boolean {
    if (fromStatus === toStatus) {
      return true;
    }

    return allowedTransitions[fromStatus].includes(toStatus);
  }

  canConvert(status: SalesQuotationStatus): boolean {
    return status === 'ACCEPTED' || status === 'CONVERTED';
  }

  assertTransition(fromStatus: SalesQuotationStatus, toStatus: SalesQuotationStatus): void {
    if (!this.canTransition(fromStatus, toStatus)) {
      throw new AppException(
        ERROR_CODES.SALES_QUOTATION_INVALID_STATUS,
        `Sales quotation transition from ${fromStatus} to ${toStatus} is not allowed.`,
        HttpStatus.CONFLICT,
      );
    }
  }

  assertConversionAllowed(status: SalesQuotationStatus): void {
    if (status === 'CONVERTED') {
      throw new AppException(
        ERROR_CODES.SALES_QUOTATION_CONVERSION_BLOCKED,
        'Sales quotation has already been converted.',
        HttpStatus.CONFLICT,
      );
    }

    if (status !== 'ACCEPTED') {
      throw new AppException(
        ERROR_CODES.SALES_QUOTATION_CONVERSION_BLOCKED,
        `Sales quotation in status ${status} is not ready to convert.`,
        HttpStatus.CONFLICT,
      );
    }
  }
}
