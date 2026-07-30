import { HttpStatus, Injectable } from '@nestjs/common';
import {
  inventoryMovementStatuses,
  type InventoryMovementStatus,
  type InventoryMovementType,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

const allowedTransitions: Record<InventoryMovementStatus, readonly InventoryMovementStatus[]> = {
  DRAFT: ['PENDING_APPROVAL', 'APPROVED', 'CANCELLED'],
  PENDING_APPROVAL: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['ALLOCATED', 'IN_PROGRESS', 'CANCELLED'],
  ALLOCATED: ['IN_PROGRESS', 'PARTIALLY_COMPLETED', 'FAILED', 'CANCELLED'],
  IN_PROGRESS: ['PARTIALLY_COMPLETED', 'COMPLETED', 'FAILED', 'CANCELLED'],
  PARTIALLY_COMPLETED: ['IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED'],
  COMPLETED: ['REVERSED'],
  CANCELLED: [],
  REJECTED: [],
  REVERSED: [],
  FAILED: ['CANCELLED'],
};

const approvalRequiredTypes: readonly InventoryMovementType[] = [
  'ISSUE',
  'TRANSFER',
  'INTERNAL_TRANSFER',
  'STATUS_TRANSFER',
  'ADJUSTMENT_OUT',
  'DISPATCH',
  'RETURN_OUT',
];

const terminalStatuses = new Set<InventoryMovementStatus>(['CANCELLED', 'REJECTED', 'REVERSED']);

@Injectable()
export class InventoryMovementStatusService {
  getAllowedTransitions(status: InventoryMovementStatus): InventoryMovementStatus[] {
    return [...allowedTransitions[status]];
  }

  getTransitionMatrix(): Record<InventoryMovementStatus, InventoryMovementStatus[]> {
    const matrix = {} as Record<InventoryMovementStatus, InventoryMovementStatus[]>;

    for (const status of inventoryMovementStatuses) {
      matrix[status] = [...allowedTransitions[status]];
    }

    return matrix;
  }

  getApprovalRequiredTypes(): InventoryMovementType[] {
    return [...approvalRequiredTypes];
  }

  getTerminalStatuses(): InventoryMovementStatus[] {
    return [...terminalStatuses];
  }

  requiresApproval(movementType: InventoryMovementType): boolean {
    return approvalRequiredTypes.includes(movementType);
  }

  canTransition(fromStatus: InventoryMovementStatus, toStatus: InventoryMovementStatus): boolean {
    if (fromStatus === toStatus) {
      return true;
    }

    return allowedTransitions[fromStatus].includes(toStatus);
  }

  isImmutable(status: InventoryMovementStatus): boolean {
    return status === 'COMPLETED' || terminalStatuses.has(status);
  }

  assertTransition(fromStatus: InventoryMovementStatus, toStatus: InventoryMovementStatus): void {
    if (!this.canTransition(fromStatus, toStatus)) {
      throw new AppException(
        ERROR_CODES.INVENTORY_MOVEMENT_INVALID_STATUS,
        `Inventory movement transition from ${fromStatus} to ${toStatus} is not allowed.`,
        HttpStatus.CONFLICT,
      );
    }
  }
}
