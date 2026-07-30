import { HttpStatus, Injectable } from '@nestjs/common';
import { type BomLineType } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type BomLine = {
  componentCode: string;
  quantityPer: number;
  lineType: BomLineType;
  children?: readonly BomLine[];
};

type BomExplosionRow = {
  componentCode: string;
  lineType: BomLineType;
  totalQuantity: number;
};

@Injectable()
export class BomExplosionService {
  getRevisionControls(): string[] {
    return [
      'Revision effective date',
      'Alternate BOM approval gate',
      'Subassembly explosion traceability',
    ];
  }

  summarizeExplosion(lines: readonly BomLine[], orderQuantity: number): BomExplosionRow[] {
    const summary = new Map<string, BomExplosionRow>();

    for (const row of this.explode(lines, orderQuantity)) {
      const existing = summary.get(row.componentCode);

      if (existing) {
        existing.totalQuantity += row.totalQuantity;
        continue;
      }

      summary.set(row.componentCode, { ...row });
    }

    return [...summary.values()];
  }

  private explode(
    lines: readonly BomLine[],
    multiplier: number,
    trail: readonly string[] = [],
  ): BomExplosionRow[] {
    return lines.flatMap((line) => {
      if (line.quantityPer <= 0) {
        return [];
      }

      if (trail.includes(line.componentCode)) {
        throw new AppException(
          ERROR_CODES.BILL_OF_MATERIAL_REVISION_CONFLICT,
          `Circular BOM reference detected at component ${line.componentCode}.`,
          HttpStatus.CONFLICT,
        );
      }

      const totalQuantity = line.quantityPer * multiplier;

      if (line.children && line.children.length > 0) {
        return this.explode(line.children, totalQuantity, [...trail, line.componentCode]);
      }

      return [
        {
          componentCode: line.componentCode,
          lineType: line.lineType,
          totalQuantity,
        },
      ];
    });
  }
}
