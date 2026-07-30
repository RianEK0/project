import { describe, expect, it } from 'vitest';

import { JournalPostingService } from './journal-posting.service';

describe('JournalPostingService', () => {
  const service = new JournalPostingService();

  it('accepts balanced journal lines and allows balanced entries to post', () => {
    const lines = [
      { debit: 1500, credit: 0 },
      { debit: 0, credit: 1500 },
    ];

    expect(service.isBalanced(lines)).toBe(true);
    expect(service.canTransition('BALANCED', 'POSTED')).toBe(true);
  });

  it('rejects unbalanced journal lines', () => {
    expect(() =>
      service.assertBalanced([
        { debit: 1000, credit: 0 },
        { debit: 0, credit: 800 },
      ]),
    ).toThrowError(/must be balanced before posting/i);
  });

  it('blocks posting for entries that are not ready or already posted', () => {
    const lines = [
      { debit: 500, credit: 0 },
      { debit: 0, credit: 500 },
    ];

    expect(() => service.assertPostable('DRAFT', lines)).toThrowError(/not ready for posting/i);
    expect(() => service.assertPostable('POSTED', lines)).toThrowError(/already been posted/i);
  });
});
