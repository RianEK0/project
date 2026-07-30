import { HttpStatus, Injectable } from '@nestjs/common';
import { journalEntryStatuses, type JournalEntryStatus } from '@nova/shared-types';

import { ERROR_CODES } from '../../common/constants/error-codes';
import { AppException } from '../../common/exceptions/app.exception';

type JournalLine = {
  debit: number;
  credit: number;
};

const allowedTransitions: Record<JournalEntryStatus, readonly JournalEntryStatus[]> = {
  DRAFT: ['BALANCED', 'CANCELLED'],
  BALANCED: ['POSTED', 'CANCELLED'],
  POSTED: ['REVERSED'],
  REVERSED: [],
  CANCELLED: [],
};

const postableStatuses = new Set<JournalEntryStatus>(['BALANCED']);
const reversibleStatuses = new Set<JournalEntryStatus>(['POSTED']);

@Injectable()
export class JournalPostingService {
  getTransitionMatrix(): Record<JournalEntryStatus, JournalEntryStatus[]> {
    const matrix = {} as Record<JournalEntryStatus, JournalEntryStatus[]>;

    for (const status of journalEntryStatuses) {
      matrix[status] = [...allowedTransitions[status]];
    }

    return matrix;
  }

  getPostableStatuses(): JournalEntryStatus[] {
    return [...postableStatuses];
  }

  getReversibleStatuses(): JournalEntryStatus[] {
    return [...reversibleStatuses];
  }

  canTransition(fromStatus: JournalEntryStatus, toStatus: JournalEntryStatus): boolean {
    if (fromStatus === toStatus) {
      return true;
    }

    return allowedTransitions[fromStatus].includes(toStatus);
  }

  isBalanced(lines: readonly JournalLine[]): boolean {
    const totals = lines.reduce(
      (summary, line) => ({
        debit: summary.debit + line.debit,
        credit: summary.credit + line.credit,
      }),
      { debit: 0, credit: 0 },
    );

    return Math.abs(totals.debit - totals.credit) < 0.0001;
  }

  assertBalanced(lines: readonly JournalLine[]): void {
    if (!this.isBalanced(lines)) {
      throw new AppException(
        ERROR_CODES.JOURNAL_ENTRY_NOT_BALANCED,
        'Journal entry total debit and credit must be balanced before posting.',
        HttpStatus.CONFLICT,
      );
    }
  }

  assertPostable(status: JournalEntryStatus, lines: readonly JournalLine[]): void {
    if (status === 'POSTED') {
      throw new AppException(
        ERROR_CODES.JOURNAL_ENTRY_ALREADY_POSTED,
        'Journal entry has already been posted.',
        HttpStatus.CONFLICT,
      );
    }

    this.assertBalanced(lines);

    if (!postableStatuses.has(status)) {
      throw new AppException(
        ERROR_CODES.POSTING_BATCH_NOT_READY,
        `Journal entry in status ${status} is not ready for posting.`,
        HttpStatus.CONFLICT,
      );
    }
  }
}
