import { HttpStatus, Injectable } from '@nestjs/common';
import {
  salesCommunicationChannels,
  type CustomerTimelineEventType,
  type SalesCommunicationChannel,
} from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

export type CustomerTimelineInputEntry = {
  id: string;
  occurredAt: Date | string;
  type: CustomerTimelineEventType;
  actorName?: string | null;
  channel?: SalesCommunicationChannel | null;
  note?: string | null;
};

export type CustomerTimelineSummary = {
  totalEntries: number;
  entries: Array<{
    id: string;
    occurredAt: string;
    type: CustomerTimelineEventType;
    actorName: string | null;
    channel: SalesCommunicationChannel | null;
    note: string | null;
  }>;
  channelCounts: Record<SalesCommunicationChannel, number>;
};

@Injectable()
export class CustomerTimelineService {
  compose(entries: readonly CustomerTimelineInputEntry[]): CustomerTimelineSummary {
    if (entries.length === 0) {
      throw new AppException(
        ERROR_CODES.CUSTOMER_TIMELINE_NOT_FOUND,
        'Customer timeline preview requires at least one event.',
        HttpStatus.CONFLICT,
      );
    }

    const normalizedEntries = entries
      .map((entry) => ({
        id: entry.id,
        occurredAt: this.parseDate(entry.occurredAt).toISOString(),
        type: entry.type,
        actorName: entry.actorName ?? null,
        channel: entry.channel ?? null,
        note: entry.note ?? null,
      }))
      .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
    const channelCounts = Object.fromEntries(
      salesCommunicationChannels.map((channel) => [
        channel,
        normalizedEntries.filter((entry) => entry.channel === channel).length,
      ]),
    ) as Record<SalesCommunicationChannel, number>;

    return {
      totalEntries: normalizedEntries.length,
      entries: normalizedEntries,
      channelCounts,
    };
  }

  private parseDate(value: Date | string): Date {
    const parsed = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      throw new AppException(
        ERROR_CODES.CUSTOMER_TIMELINE_NOT_FOUND,
        'Customer timeline event date is invalid.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return parsed;
  }
}
