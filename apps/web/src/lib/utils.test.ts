import { describe, expect, it } from 'vitest';

import { formatDate } from './utils';

describe('formatDate', () => {
  it('formats a date into a readable string', () => {
    const formatted = formatDate('2026-07-23T10:30:00.000Z');

    expect(formatted.length).toBeGreaterThan(0);
  });
});
