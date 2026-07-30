import { HttpStatus, Injectable } from '@nestjs/common';
import {
  inventoryAllocationStrategies,
  type InventoryAllocationStatus,
  type InventoryAllocationStrategy,
  type InventoryBalanceStatus,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type NumericLike = number | string;

export type AllocationCandidate = {
  id: string;
  inventoryBalanceId?: string | null;
  availableQuantity: NumericLike;
  inventoryStatus: InventoryBalanceStatus;
  receivedAt?: Date | string | null;
  expirationDate?: Date | string | null;
  locationPriority?: number | null;
};

export type InventoryAllocationPreviewRequest = {
  requiredQuantity: NumericLike;
  strategy: InventoryAllocationStrategy;
  candidates: readonly AllocationCandidate[];
  allowPartial?: boolean;
  preferredCandidateIds?: readonly string[];
  asOf?: Date | string;
};

export type InventoryAllocationPreview = {
  status: InventoryAllocationStatus;
  requestedQuantity: number;
  allocatedQuantity: number;
  shortageQuantity: number;
  allocations: Array<{
    candidateId: string;
    inventoryBalanceId: string | null;
    quantity: number;
  }>;
};

const blockedStatuses: readonly InventoryBalanceStatus[] = [
  'QUARANTINE',
  'DAMAGED',
  'EXPIRED',
  'BLOCKED',
];

@Injectable()
export class InventoryAllocationPolicyService {
  getStrategies(): InventoryAllocationStrategy[] {
    return [...inventoryAllocationStrategies];
  }

  getBlockedStatuses(): InventoryBalanceStatus[] {
    return [...blockedStatuses];
  }

  preview(request: InventoryAllocationPreviewRequest): InventoryAllocationPreview {
    const requiredQuantity = this.parseQuantity(
      request.requiredQuantity,
      'Requested allocation quantity',
    );

    if (requiredQuantity <= 0) {
      throw new AppException(
        ERROR_CODES.INVENTORY_ALLOCATION_FAILED,
        'Requested allocation quantity must be greater than zero.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const asOf = this.parseDate(request.asOf ?? new Date());
    const sortedCandidates = this.sortCandidates(
      request.candidates.filter((candidate) => this.isAllocatable(candidate, asOf)),
      request.strategy,
      request.preferredCandidateIds ?? [],
    );

    let remainingQuantity = requiredQuantity;
    const allocations: InventoryAllocationPreview['allocations'] = [];

    for (const candidate of sortedCandidates) {
      if (remainingQuantity <= 0.0001) {
        break;
      }

      const availableQuantity = this.parseQuantity(
        candidate.availableQuantity,
        `Available quantity for candidate ${candidate.id}`,
      );

      if (availableQuantity <= 0) {
        continue;
      }

      const allocatedQuantity = Math.min(availableQuantity, remainingQuantity);

      allocations.push({
        candidateId: candidate.id,
        inventoryBalanceId: candidate.inventoryBalanceId ?? null,
        quantity: allocatedQuantity,
      });

      remainingQuantity -= allocatedQuantity;
    }

    const allocatedQuantity = allocations.reduce(
      (total, allocation) => total + allocation.quantity,
      0,
    );
    const shortageQuantity = Math.max(remainingQuantity, 0);

    if (allocatedQuantity <= 0) {
      throw new AppException(
        ERROR_CODES.INVENTORY_ALLOCATION_FAILED,
        'No allocatable stock matched the requested strategy.',
        HttpStatus.CONFLICT,
      );
    }

    if (shortageQuantity > 0.0001 && !request.allowPartial) {
      throw new AppException(
        ERROR_CODES.INVENTORY_ALLOCATION_FAILED,
        'Insufficient allocatable stock to satisfy the full requested quantity.',
        HttpStatus.CONFLICT,
      );
    }

    return {
      status: shortageQuantity > 0.0001 ? 'PARTIALLY_ALLOCATED' : 'ALLOCATED',
      requestedQuantity: requiredQuantity,
      allocatedQuantity,
      shortageQuantity,
      allocations,
    };
  }

  private isAllocatable(candidate: AllocationCandidate, asOf: Date): boolean {
    if (candidate.inventoryStatus !== 'AVAILABLE') {
      return false;
    }

    const expirationDate = this.parseOptionalDate(candidate.expirationDate);

    if (expirationDate && expirationDate.getTime() < asOf.getTime()) {
      return false;
    }

    return (
      this.parseQuantity(
        candidate.availableQuantity,
        `Available quantity for candidate ${candidate.id}`,
      ) > 0
    );
  }

  private sortCandidates(
    candidates: readonly AllocationCandidate[],
    strategy: InventoryAllocationStrategy,
    preferredCandidateIds: readonly string[],
  ): AllocationCandidate[] {
    const sorted = [...candidates];
    const preferredOrder = new Map(
      preferredCandidateIds.map((candidateId, index) => [candidateId, index]),
    );

    const byManualPreference = (left: AllocationCandidate, right: AllocationCandidate) =>
      (preferredOrder.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
      (preferredOrder.get(right.id) ?? Number.MAX_SAFE_INTEGER);
    const byReceivedAtAscending = (left: AllocationCandidate, right: AllocationCandidate) =>
      this.getTimestamp(left.receivedAt) - this.getTimestamp(right.receivedAt);
    const byReceivedAtDescending = (left: AllocationCandidate, right: AllocationCandidate) =>
      this.getTimestamp(right.receivedAt) - this.getTimestamp(left.receivedAt);
    const byExpirationAscending = (left: AllocationCandidate, right: AllocationCandidate) =>
      this.getTimestamp(left.expirationDate) - this.getTimestamp(right.expirationDate);
    const byLocationPriority = (left: AllocationCandidate, right: AllocationCandidate) =>
      (left.locationPriority ?? Number.MAX_SAFE_INTEGER) -
      (right.locationPriority ?? Number.MAX_SAFE_INTEGER);

    switch (strategy) {
      case 'MANUAL':
      case 'LOT_EXPLICIT':
      case 'SERIAL_EXPLICIT':
        return sorted.sort((left, right) => byManualPreference(left, right));
      case 'FIFO':
        return sorted.sort(
          (left, right) => byReceivedAtAscending(left, right) || byExpirationAscending(left, right),
        );
      case 'FEFO':
        return sorted.sort(
          (left, right) => byExpirationAscending(left, right) || byReceivedAtAscending(left, right),
        );
      case 'LIFO':
        return sorted.sort(
          (left, right) =>
            byReceivedAtDescending(left, right) || byExpirationAscending(left, right),
        );
      case 'LOCATION_PRIORITY':
        return sorted.sort(
          (left, right) => byLocationPriority(left, right) || byReceivedAtAscending(left, right),
        );
      case 'SYSTEM_DEFAULT':
        return sorted.some((candidate) => candidate.expirationDate)
          ? this.sortCandidates(sorted, 'FEFO', preferredCandidateIds)
          : this.sortCandidates(sorted, 'FIFO', preferredCandidateIds);
      default:
        return sorted;
    }
  }

  private parseQuantity(value: NumericLike, label: string): number {
    const parsed = typeof value === 'number' ? value : Number.parseFloat(value);

    if (!Number.isFinite(parsed)) {
      throw new AppException(
        ERROR_CODES.INVENTORY_ALLOCATION_FAILED,
        `${label} must be numeric.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return parsed;
  }

  private parseDate(value: Date | string): Date {
    const parsed = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      throw new AppException(
        ERROR_CODES.INVENTORY_ALLOCATION_FAILED,
        'Allocation preview date is invalid.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return parsed;
  }

  private parseOptionalDate(value: Date | string | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    return this.parseDate(value);
  }

  private getTimestamp(value: Date | string | null | undefined): number {
    const parsed = this.parseOptionalDate(value);

    return parsed ? parsed.getTime() : Number.MAX_SAFE_INTEGER;
  }
}
