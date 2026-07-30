import { HttpStatus, Injectable } from '@nestjs/common';
import { type TaxCalculationMode } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

export type TaxEngineLineInput = {
  lineId: string;
  taxableAmount: number;
  ratePct: number;
  mode: TaxCalculationMode;
};

export type TaxEngineSummary = {
  totals: {
    netAmount: number;
    taxAmount: number;
    grossAmount: number;
  };
  lines: Array<{
    lineId: string;
    netAmount: number;
    taxAmount: number;
    grossAmount: number;
    mode: TaxCalculationMode;
  }>;
};

@Injectable()
export class TaxEngineService {
  evaluate(lines: readonly TaxEngineLineInput[]): TaxEngineSummary {
    if (lines.length === 0) {
      throw new AppException(
        ERROR_CODES.TAX_RULE_INVALID,
        'Tax evaluation requires at least one line.',
        HttpStatus.CONFLICT,
      );
    }

    const evaluatedLines = lines.map((line) => {
      if (line.taxableAmount < 0 || line.ratePct < 0) {
        throw new AppException(
          ERROR_CODES.TAX_RULE_INVALID,
          'Tax engine requires non-negative amount and rate.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const rate = line.ratePct / 100;

      switch (line.mode) {
        case 'EXCLUSIVE': {
          const netAmount = this.round(line.taxableAmount);
          const taxAmount = this.round(netAmount * rate);
          const grossAmount = this.round(netAmount + taxAmount);

          return { lineId: line.lineId, netAmount, taxAmount, grossAmount, mode: line.mode };
        }
        case 'INCLUSIVE': {
          const grossAmount = this.round(line.taxableAmount);
          const netAmount = this.round(grossAmount / (1 + rate));
          const taxAmount = this.round(grossAmount - netAmount);

          return { lineId: line.lineId, netAmount, taxAmount, grossAmount, mode: line.mode };
        }
        case 'ZERO_RATED':
        case 'EXEMPT':
          return {
            lineId: line.lineId,
            netAmount: this.round(line.taxableAmount),
            taxAmount: 0,
            grossAmount: this.round(line.taxableAmount),
            mode: line.mode,
          };
        default:
          throw new AppException(
            ERROR_CODES.TAX_RULE_INVALID,
            'Tax mode is not supported.',
            HttpStatus.BAD_REQUEST,
          );
      }
    });

    return {
      totals: {
        netAmount: this.round(evaluatedLines.reduce((total, line) => total + line.netAmount, 0)),
        taxAmount: this.round(evaluatedLines.reduce((total, line) => total + line.taxAmount, 0)),
        grossAmount: this.round(
          evaluatedLines.reduce((total, line) => total + line.grossAmount, 0),
        ),
      },
      lines: evaluatedLines,
    };
  }

  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
