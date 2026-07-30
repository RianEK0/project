import { HttpStatus, Injectable } from '@nestjs/common';
import { cronFrequencies, type CronFrequency } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type CronScheduleInput = {
  frequency: CronFrequency;
  anchorAt: string;
  occurrences?: number;
  everyMinutes?: number;
};

export type CronSchedulePreview = {
  frequency: CronFrequency;
  cadenceSummary: string;
  nextRuns: string[];
};

@Injectable()
export class CronSchedulePreviewService {
  getFrequencies(): CronFrequency[] {
    return [...cronFrequencies];
  }

  previewSchedule(input: CronScheduleInput): CronSchedulePreview {
    const anchorDate = new Date(input.anchorAt);
    const occurrences = input.occurrences ?? 3;

    if (Number.isNaN(anchorDate.getTime()) || occurrences < 1 || occurrences > 10) {
      throw new AppException(
        ERROR_CODES.CRON_EXPRESSION_INVALID,
        'Cron preview requires a valid anchor date and 1-10 occurrences.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (input.frequency === 'CUSTOM' && (!input.everyMinutes || input.everyMinutes < 1)) {
      throw new AppException(
        ERROR_CODES.CRON_EXPRESSION_INVALID,
        'Custom cron preview requires a positive minute interval.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const nextRuns: string[] = [];
    let currentRun = new Date(anchorDate);

    for (let index = 0; index < occurrences; index += 1) {
      currentRun = this.advanceSchedule(currentRun, input.frequency, input.everyMinutes);
      nextRuns.push(currentRun.toISOString());
    }

    return {
      frequency: input.frequency,
      cadenceSummary:
        input.frequency === 'CUSTOM'
          ? `Every ${input.everyMinutes} minutes`
          : input.frequency.toLowerCase(),
      nextRuns,
    };
  }

  private advanceSchedule(date: Date, frequency: CronFrequency, everyMinutes?: number): Date {
    const nextDate = new Date(date);

    switch (frequency) {
      case 'HOURLY':
        nextDate.setUTCHours(nextDate.getUTCHours() + 1);
        return nextDate;
      case 'DAILY':
        nextDate.setUTCDate(nextDate.getUTCDate() + 1);
        return nextDate;
      case 'WEEKLY':
        nextDate.setUTCDate(nextDate.getUTCDate() + 7);
        return nextDate;
      case 'MONTHLY':
        nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
        return nextDate;
      case 'CUSTOM':
        nextDate.setUTCMinutes(nextDate.getUTCMinutes() + (everyMinutes ?? 0));
        return nextDate;
    }
  }
}
