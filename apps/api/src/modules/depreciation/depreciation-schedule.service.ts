import { HttpStatus, Injectable } from '@nestjs/common';
import { depreciationMethods, type DepreciationMethod } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type DepreciationPreviewInput = {
  acquisitionCost: number;
  residualValue: number;
  usefulLifeMonths: number;
  inServiceDate: string;
  method: DepreciationMethod;
};

type DepreciationScheduleLine = {
  periodNumber: number;
  depreciationDate: string;
  depreciationAmount: number;
  endingBookValue: number;
};

const supportedPreviewMethods = new Set<DepreciationMethod>(['STRAIGHT_LINE']);

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

function addMonths(dateString: string, months: number) {
  const date = new Date(dateString);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString();
}

@Injectable()
export class DepreciationScheduleService {
  getSupportedPreviewMethods(): DepreciationMethod[] {
    return depreciationMethods.filter((method) => supportedPreviewMethods.has(method));
  }

  previewSchedule(input: DepreciationPreviewInput) {
    const { acquisitionCost, residualValue, usefulLifeMonths, inServiceDate, method } = input;

    if (!supportedPreviewMethods.has(method)) {
      throw new AppException(
        ERROR_CODES.DEPRECIATION_METHOD_INVALID,
        `Depreciation preview for method ${method} is not supported in this foundation.`,
        HttpStatus.CONFLICT,
      );
    }

    if (usefulLifeMonths <= 0 || residualValue >= acquisitionCost) {
      throw new AppException(
        ERROR_CODES.VALIDATION_ERROR,
        'Depreciation preview requires residual value lower than acquisition cost and positive useful life.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const depreciableBase = acquisitionCost - residualValue;
    const standardAmount = roundCurrency(depreciableBase / usefulLifeMonths);
    let remainingBookValue = acquisitionCost;
    let remainingDepreciable = depreciableBase;

    const schedule: DepreciationScheduleLine[] = [];

    for (let index = 0; index < usefulLifeMonths; index += 1) {
      const isFinalPeriod = index === usefulLifeMonths - 1;
      const depreciationAmount = isFinalPeriod
        ? roundCurrency(remainingDepreciable)
        : roundCurrency(standardAmount);

      remainingBookValue = roundCurrency(remainingBookValue - depreciationAmount);
      remainingDepreciable = roundCurrency(remainingDepreciable - depreciationAmount);

      schedule.push({
        periodNumber: index + 1,
        depreciationDate: addMonths(inServiceDate, index + 1),
        depreciationAmount,
        endingBookValue: isFinalPeriod ? residualValue : remainingBookValue,
      });
    }

    return {
      method,
      depreciableBase: roundCurrency(depreciableBase),
      monthlyDepreciationAmount: standardAmount,
      endingResidualValue: residualValue,
      schedule,
    };
  }
}
