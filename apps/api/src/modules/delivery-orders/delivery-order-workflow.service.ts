import { HttpStatus, Injectable } from '@nestjs/common';
import { deliveryOrderStatuses, type DeliveryOrderStatus } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

const allowedTransitions: Record<DeliveryOrderStatus, readonly DeliveryOrderStatus[]> = {
  DRAFT: ['READY_TO_PICK', 'CANCELLED'],
  READY_TO_PICK: ['PICKING', 'CANCELLED'],
  PICKING: ['PACKED', 'CANCELLED'],
  PACKED: ['DISPATCHED', 'CANCELLED'],
  DISPATCHED: ['PARTIALLY_DELIVERED', 'DELIVERED', 'CANCELLED'],
  PARTIALLY_DELIVERED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

@Injectable()
export class DeliveryOrderWorkflowService {
  getTransitionMatrix(): Record<DeliveryOrderStatus, DeliveryOrderStatus[]> {
    const matrix = {} as Record<DeliveryOrderStatus, DeliveryOrderStatus[]>;

    for (const status of deliveryOrderStatuses) {
      matrix[status] = [...allowedTransitions[status]];
    }

    return matrix;
  }

  canTransition(fromStatus: DeliveryOrderStatus, toStatus: DeliveryOrderStatus): boolean {
    if (fromStatus === toStatus) {
      return true;
    }

    return allowedTransitions[fromStatus].includes(toStatus);
  }

  assertTransition(fromStatus: DeliveryOrderStatus, toStatus: DeliveryOrderStatus): void {
    if (!this.canTransition(fromStatus, toStatus)) {
      throw new AppException(
        ERROR_CODES.DELIVERY_ORDER_NOT_READY,
        `Delivery order transition from ${fromStatus} to ${toStatus} is not allowed.`,
        HttpStatus.CONFLICT,
      );
    }
  }

  assertDispatchReady(status: DeliveryOrderStatus): void {
    if (status !== 'PACKED') {
      throw new AppException(
        ERROR_CODES.DELIVERY_ORDER_NOT_READY,
        `Delivery order in status ${status} is not ready to dispatch.`,
        HttpStatus.CONFLICT,
      );
    }
  }
}
