import { HttpStatus, Injectable } from '@nestjs/common';
import {
  mrpExceptionTypes,
  mrpStatuses,
  type MrpExceptionType,
  type MrpStatus,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type MrpRequirementInput = {
  itemCode: string;
  grossRequirement: number;
  onHand: number;
  scheduledReceipts: number;
  safetyStock: number;
  lotSize: number;
};

type MrpRequirementPreview = {
  itemCode: string;
  status: Exclude<MrpStatus, 'RUNNING'>;
  exceptionType: MrpExceptionType;
  availableAfterSafetyStock: number;
  netRequirement: number;
  plannedOrderReceipt: number;
};

@Injectable()
export class MrpNetRequirementService {
  getStatuses(): MrpStatus[] {
    return [...mrpStatuses];
  }

  getExceptionTypes(): MrpExceptionType[] {
    return [...mrpExceptionTypes];
  }

  getSupplySources(): string[] {
    return ['Purchase', 'Production Order', 'Transfer', 'Subcontract'];
  }

  assertRunnable(status: MrpStatus): void {
    if (status === 'RUNNING') {
      throw new AppException(
        ERROR_CODES.MRP_RUN_IN_PROGRESS,
        'MRP run is already in progress for the current planning bucket.',
        HttpStatus.CONFLICT,
      );
    }
  }

  previewRequirement(input: MrpRequirementInput): MrpRequirementPreview {
    const availableAfterSafetyStock = input.onHand + input.scheduledReceipts - input.safetyStock;
    const netRequirement = Math.max(input.grossRequirement - availableAfterSafetyStock, 0);
    const plannedOrderReceipt =
      netRequirement > 0 ? Math.ceil(netRequirement / input.lotSize) * input.lotSize : 0;

    if (plannedOrderReceipt > 0) {
      return {
        itemCode: input.itemCode,
        status: 'EXCEPTION',
        exceptionType: 'SHORTAGE',
        availableAfterSafetyStock,
        netRequirement,
        plannedOrderReceipt,
      };
    }

    return {
      itemCode: input.itemCode,
      status: 'COMPLETED',
      exceptionType:
        availableAfterSafetyStock - input.grossRequirement > input.lotSize
          ? 'EXCESS'
          : 'RESCHEDULE_OUT',
      availableAfterSafetyStock,
      netRequirement,
      plannedOrderReceipt,
    };
  }
}
