import { HttpStatus, Injectable } from '@nestjs/common';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type NumericLike = number | string;

export type InventoryBalanceSnapshot = {
  onHandQuantity: NumericLike;
  reservedQuantity?: NumericLike;
  damagedQuantity?: NumericLike;
  quarantineQuantity?: NumericLike;
  incomingQuantity?: NumericLike;
  outgoingQuantity?: NumericLike;
};

export type InventoryAvailabilitySummary = {
  onHand: number;
  reserved: number;
  available: number;
  projected: number;
  damaged: number;
  quarantine: number;
};

@Injectable()
export class InventoryAvailabilityService {
  summarize(snapshot: InventoryBalanceSnapshot): InventoryAvailabilitySummary {
    const onHand = this.parse(snapshot.onHandQuantity);
    const reserved = this.parse(snapshot.reservedQuantity ?? 0);
    const damaged = this.parse(snapshot.damagedQuantity ?? 0);
    const quarantine = this.parse(snapshot.quarantineQuantity ?? 0);
    const incoming = this.parse(snapshot.incomingQuantity ?? 0);
    const outgoing = this.parse(snapshot.outgoingQuantity ?? 0);
    const available = onHand - reserved - damaged - quarantine;

    if (available < -0.0001) {
      throw new AppException(
        ERROR_CODES.INVENTORY_INVARIANT_VIOLATION,
        'Inventory availability fell below zero after applying balance deductions.',
        HttpStatus.CONFLICT,
      );
    }

    return {
      onHand,
      reserved,
      available,
      projected: available + incoming - outgoing,
      damaged,
      quarantine,
    };
  }

  assertReservable(
    summary: InventoryAvailabilitySummary,
    requestedQuantity: NumericLike,
    allowNegativeStock = false,
  ): void {
    const requested = this.parse(requestedQuantity);

    if (requested <= 0) {
      throw new AppException(
        ERROR_CODES.INVENTORY_QUANTITY_INVALID,
        'Reservation quantity must be greater than zero.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!allowNegativeStock && requested > summary.available) {
      throw new AppException(
        ERROR_CODES.INVENTORY_INSUFFICIENT_STOCK,
        `Requested quantity ${requested} exceeds available quantity ${summary.available}.`,
        HttpStatus.CONFLICT,
      );
    }
  }

  private parse(value: NumericLike): number {
    const parsed = typeof value === 'number' ? value : Number.parseFloat(value);

    if (!Number.isFinite(parsed)) {
      throw new AppException(
        ERROR_CODES.INVENTORY_QUANTITY_INVALID,
        'Inventory quantity must be numeric.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return parsed;
  }
}
