import { describe, expect, it } from 'vitest';

import { FinancialStatementComposerService } from './financial-statement-composer.service';

describe('FinancialStatementComposerService', () => {
  const service = new FinancialStatementComposerService();

  it('keeps balance sheet sections grouped by assets, liabilities, and equity', () => {
    expect(service.getSections('BALANCE_SHEET')).toEqual(['Assets', 'Liabilities', 'Equity']);
  });

  it('keeps profit-loss and cash-flow sections distinct', () => {
    expect(service.getSections('PROFIT_LOSS')).toContain('Revenue');
    expect(service.getSections('CASH_FLOW')).toContain('Operating Activities');
  });

  it('builds a catalog that links statement routes back to the finance workspace', () => {
    const catalog = service.getCatalog();

    expect(catalog).toHaveLength(5);
    expect(catalog.find((statement) => statement.type === 'GENERAL_LEDGER')?.route).toBe(
      '/app/finance/general-ledger',
    );
  });
});
