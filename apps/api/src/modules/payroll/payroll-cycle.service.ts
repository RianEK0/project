import { HttpStatus, Injectable } from '@nestjs/common';
import { payrollFrequencies, type PayrollFrequency, type PayrollStatus } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type PayrollPreviewInput = {
  employeeCount: number;
  frequency: PayrollFrequency;
  baseSalaryTotal: number;
  allowanceTotal: number;
  deductionTotal: number;
  periodStart: string;
  periodEnd: string;
};

type PayrollRunPreview = {
  status: PayrollStatus;
  employeeCount: number;
  grossAmount: number;
  deductionAmount: number;
  netAmount: number;
  payoutWindow: string;
};

const finalizedStatuses = new Set<PayrollStatus>(['APPROVED', 'POSTED', 'PAID']);

@Injectable()
export class PayrollCycleService {
  getSupportedFrequencies(): PayrollFrequency[] {
    return [...payrollFrequencies];
  }

  getControlPoints(): string[] {
    return [
      'Attendance and leave cut-off',
      'Allowance and deduction lock',
      'Manager and payroll approval',
    ];
  }

  assertProcessable(status: PayrollStatus): void {
    if (finalizedStatuses.has(status)) {
      throw new AppException(
        ERROR_CODES.PAYROLL_RUN_ALREADY_PROCESSED,
        `Payroll run in status ${status} cannot be recalculated.`,
        HttpStatus.CONFLICT,
      );
    }
  }

  previewRun(input: PayrollPreviewInput): PayrollRunPreview {
    const grossAmount = input.baseSalaryTotal + input.allowanceTotal;
    const netAmount = grossAmount - input.deductionTotal;

    return {
      status: 'CALCULATED',
      employeeCount: input.employeeCount,
      grossAmount,
      deductionAmount: input.deductionTotal,
      netAmount,
      payoutWindow: `${input.frequency} ${input.periodStart} -> ${input.periodEnd}`,
    };
  }
}
