import { HttpStatus, Injectable } from '@nestjs/common';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

export type AvailabilityRange = {
  startAt: Date;
  endAt: Date;
};

@Injectable()
export class AvailabilityOverlapService {
  assertValidRange(range: AvailabilityRange): void {
    if (range.startAt >= range.endAt) {
      throw new AppException(
        ERROR_CODES.VALIDATION_ERROR,
        'Availability range start time must be before end time.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  hasOverlap(requested: AvailabilityRange, existing: AvailabilityRange): boolean {
    this.assertValidRange(requested);
    this.assertValidRange(existing);

    return existing.startAt < requested.endAt && existing.endAt > requested.startAt;
  }

  filterOverlaps(requested: AvailabilityRange, existingRanges: AvailabilityRange[]): AvailabilityRange[] {
    this.assertValidRange(requested);

    return existingRanges.filter((range) => this.hasOverlap(requested, range));
  }
}
