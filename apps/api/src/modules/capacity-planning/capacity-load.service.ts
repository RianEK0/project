import { HttpStatus, Injectable } from '@nestjs/common';
import { capacityPlanningStatuses, type CapacityPlanningStatus } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type CapacityPreviewInput = {
  workCenter: string;
  availableHours: number;
  plannedHours: number;
  overtimeBufferHours: number;
};

type CapacityLoadPreview = {
  workCenter: string;
  status: CapacityPlanningStatus;
  effectiveCapacityHours: number;
  plannedHours: number;
  utilizationRate: number;
  gapHours: number;
};

@Injectable()
export class CapacityLoadService {
  getStatuses(): CapacityPlanningStatus[] {
    return [...capacityPlanningStatuses];
  }

  getBalancingLevers(): string[] {
    return ['Reschedule', 'Overtime', 'Alternate Machine', 'Subcontract'];
  }

  previewLoad(input: CapacityPreviewInput): CapacityLoadPreview {
    const effectiveCapacityHours = input.availableHours + input.overtimeBufferHours;
    const utilizationRate =
      effectiveCapacityHours > 0 ? input.plannedHours / effectiveCapacityHours : 0;

    let status: CapacityPlanningStatus = 'BALANCED';

    if (utilizationRate > 1) {
      status = 'OVERLOADED';
    } else if (utilizationRate < 0.7) {
      status = 'UNDERUTILIZED';
    }

    return {
      workCenter: input.workCenter,
      status,
      effectiveCapacityHours,
      plannedHours: input.plannedHours,
      utilizationRate: Number(utilizationRate.toFixed(4)),
      gapHours: Number((effectiveCapacityHours - input.plannedHours).toFixed(2)),
    };
  }

  assertCapacityAvailable(input: CapacityPreviewInput): void {
    const preview = this.previewLoad(input);

    if (preview.status === 'OVERLOADED') {
      throw new AppException(
        ERROR_CODES.CAPACITY_OVERLOADED,
        `Work center ${input.workCenter} exceeds effective available hours.`,
        HttpStatus.CONFLICT,
      );
    }
  }
}
