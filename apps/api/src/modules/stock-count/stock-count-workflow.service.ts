import { HttpStatus, Injectable } from '@nestjs/common';
import { stockCountStatuses, type StockCountStatus } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

const allowedTransitions: Record<StockCountStatus, readonly StockCountStatus[]> = {
  DRAFT: ['SCHEDULED', 'IN_PROGRESS', 'CANCELLED'],
  SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['APPROVED', 'CANCELLED'],
  APPROVED: ['POSTED', 'CANCELLED'],
  POSTED: [],
  CANCELLED: [],
};

const freezeBlockingStatuses: readonly StockCountStatus[] = [
  'IN_PROGRESS',
  'SUBMITTED',
  'APPROVED',
];

@Injectable()
export class StockCountWorkflowService {
  getAllowedTransitions(status: StockCountStatus): StockCountStatus[] {
    return [...allowedTransitions[status]];
  }

  getTransitionMatrix(): Record<StockCountStatus, StockCountStatus[]> {
    const matrix = {} as Record<StockCountStatus, StockCountStatus[]>;

    for (const status of stockCountStatuses) {
      matrix[status] = [...allowedTransitions[status]];
    }

    return matrix;
  }

  getFreezeBlockingStatuses(): StockCountStatus[] {
    return [...freezeBlockingStatuses];
  }

  canTransition(fromStatus: StockCountStatus, toStatus: StockCountStatus): boolean {
    if (fromStatus === toStatus) {
      return true;
    }

    return allowedTransitions[fromStatus].includes(toStatus);
  }

  assertTransition(fromStatus: StockCountStatus, toStatus: StockCountStatus): void {
    if (!this.canTransition(fromStatus, toStatus)) {
      throw new AppException(
        ERROR_CODES.STOCK_COUNT_VARIANCE_INVALID,
        `Stock count transition from ${fromStatus} to ${toStatus} is not allowed.`,
        HttpStatus.CONFLICT,
      );
    }
  }

  assertMovementAllowed(status: StockCountStatus, freezeStock: boolean): void {
    if (freezeStock && freezeBlockingStatuses.includes(status)) {
      throw new AppException(
        ERROR_CODES.STOCK_COUNT_FREEZE_ACTIVE,
        'Stock movement is blocked while the stock count freeze window is active.',
        HttpStatus.CONFLICT,
      );
    }
  }
}
