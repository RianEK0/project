import { HttpStatus, Injectable } from '@nestjs/common';
import { installmentFrequencies, type InstallmentFrequency } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

export type InstallmentPlanInput = {
  principalAmount: number;
  installmentCount: number;
  firstDueDate: string;
  frequency: InstallmentFrequency;
};

export type InstallmentPlanPreview = {
  totalAmount: number;
  schedule: Array<{
    installmentNumber: number;
    dueDate: string;
    amount: number;
  }>;
};

@Injectable()
export class InstallmentPlanService {
  getSupportedFrequencies(): InstallmentFrequency[] {
    return [...installmentFrequencies];
  }

  preview(input: InstallmentPlanInput): InstallmentPlanPreview {
    if (input.principalAmount <= 0 || input.installmentCount <= 0) {
      throw new AppException(
        ERROR_CODES.INSTALLMENT_SCHEDULE_INVALID,
        'Installment principal and count must be positive.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const firstDueDate = new Date(input.firstDueDate);

    if (Number.isNaN(firstDueDate.getTime())) {
      throw new AppException(
        ERROR_CODES.INSTALLMENT_SCHEDULE_INVALID,
        'Installment first due date is invalid.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const baseAmount =
      Math.floor(((input.principalAmount / input.installmentCount) * 100) / 1) / 100;
    const schedule = Array.from({ length: input.installmentCount }, (_, index) => {
      const dueDate = this.shiftDate(firstDueDate, index, input.frequency);
      const amount =
        index === input.installmentCount - 1
          ? this.round(input.principalAmount - baseAmount * (input.installmentCount - 1))
          : this.round(baseAmount);

      return {
        installmentNumber: index + 1,
        dueDate: dueDate.toISOString(),
        amount,
      };
    });

    return {
      totalAmount: this.round(schedule.reduce((total, item) => total + item.amount, 0)),
      schedule,
    };
  }

  private shiftDate(baseDate: Date, step: number, frequency: InstallmentFrequency): Date {
    const nextDate = new Date(baseDate);

    switch (frequency) {
      case 'WEEKLY':
        nextDate.setUTCDate(nextDate.getUTCDate() + step * 7);
        return nextDate;
      case 'BIWEEKLY':
        nextDate.setUTCDate(nextDate.getUTCDate() + step * 14);
        return nextDate;
      case 'MONTHLY':
        nextDate.setUTCMonth(nextDate.getUTCMonth() + step);
        return nextDate;
      default:
        throw new AppException(
          ERROR_CODES.INSTALLMENT_SCHEDULE_INVALID,
          'Installment frequency is not supported.',
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
