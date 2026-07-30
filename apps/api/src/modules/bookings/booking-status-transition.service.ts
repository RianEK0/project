import { HttpStatus, Injectable } from '@nestjs/common';
import type { BookingStatus } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

const allowedTransitions: Record<BookingStatus, readonly BookingStatus[]> = {
  DRAFT: ['PENDING', 'CANCELLED', 'EXPIRED'],
  PENDING: ['PENDING_APPROVAL', 'CONFIRMED', 'CANCELLED', 'EXPIRED'],
  PENDING_APPROVAL: ['CONFIRMED', 'CANCELLED', 'EXPIRED'],
  CONFIRMED: ['PARTIALLY_PAID', 'PAID', 'CHECKED_IN', 'IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
  PARTIALLY_PAID: ['PAID', 'CHECKED_IN', 'IN_PROGRESS', 'CANCELLED'],
  PAID: ['CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'REFUNDED'],
  CHECKED_IN: ['IN_PROGRESS', 'COMPLETED', 'NO_SHOW'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
  EXPIRED: [],
  REFUNDED: [],
};

@Injectable()
export class BookingStatusTransitionService {
  getAllowedTransitions(status: BookingStatus): BookingStatus[] {
    return [...allowedTransitions[status]];
  }

  canTransition(fromStatus: BookingStatus, toStatus: BookingStatus): boolean {
    if (fromStatus === toStatus) {
      return true;
    }

    return allowedTransitions[fromStatus].includes(toStatus);
  }

  assertTransition(fromStatus: BookingStatus, toStatus: BookingStatus): void {
    if (!this.canTransition(fromStatus, toStatus)) {
      throw new AppException(
        ERROR_CODES.INVALID_BOOKING_STATUS_TRANSITION,
        `Booking status transition from ${fromStatus} to ${toStatus} is not allowed.`,
        HttpStatus.CONFLICT,
      );
    }
  }
}
