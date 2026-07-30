import { HttpStatus, Injectable } from '@nestjs/common';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type LeaveBalancePreviewInput = {
  annualEntitlementDays: number;
  carryForwardDays: number;
  takenDays: number;
  pendingDays: number;
  requestedDays: number;
};

type LeaveBalancePreview = {
  availableDays: number;
  pendingDays: number;
  remainingDays: number;
  requestable: boolean;
};

@Injectable()
export class LeaveBalanceService {
  previewBalance(input: LeaveBalancePreviewInput): LeaveBalancePreview {
    const availableDays = Math.max(
      input.annualEntitlementDays + input.carryForwardDays - input.takenDays,
      0,
    );
    const remainingDays = Math.max(availableDays - input.pendingDays, 0);

    return {
      availableDays,
      pendingDays: input.pendingDays,
      remainingDays,
      requestable: input.requestedDays <= remainingDays,
    };
  }

  assertSufficientBalance(input: LeaveBalancePreviewInput): void {
    const preview = this.previewBalance(input);

    if (!preview.requestable) {
      throw new AppException(
        ERROR_CODES.LEAVE_BALANCE_INSUFFICIENT,
        'Leave request exceeds the remaining leave balance after pending approvals.',
        HttpStatus.CONFLICT,
      );
    }
  }
}
