import { Injectable } from '@nestjs/common';
import { financialStatementTypes, type FinancialStatementType } from '@nova/shared-types';

type StatementCatalogItem = {
  type: FinancialStatementType;
  route: string;
  sections: string[];
};

@Injectable()
export class FinancialStatementComposerService {
  getStatementTypes(): FinancialStatementType[] {
    return [...financialStatementTypes];
  }

  getSections(type: FinancialStatementType): string[] {
    switch (type) {
      case 'BALANCE_SHEET':
        return ['Assets', 'Liabilities', 'Equity'];
      case 'PROFIT_LOSS':
        return ['Revenue', 'Cost Of Sales', 'Operating Expenses', 'Other Income/Expense'];
      case 'CASH_FLOW':
        return ['Operating Activities', 'Investing Activities', 'Financing Activities'];
      case 'TRIAL_BALANCE':
        return ['Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses'];
      case 'GENERAL_LEDGER':
        return ['Account Activity', 'Period Totals', 'Running Balance'];
    }
  }

  getCatalog(): StatementCatalogItem[] {
    return [
      {
        type: 'BALANCE_SHEET',
        route: '/app/finance/balance-sheet',
        sections: this.getSections('BALANCE_SHEET'),
      },
      {
        type: 'PROFIT_LOSS',
        route: '/app/finance/profit-loss',
        sections: this.getSections('PROFIT_LOSS'),
      },
      {
        type: 'CASH_FLOW',
        route: '/app/finance/cash-flow',
        sections: this.getSections('CASH_FLOW'),
      },
      {
        type: 'TRIAL_BALANCE',
        route: '/app/finance/financial-statements',
        sections: this.getSections('TRIAL_BALANCE'),
      },
      {
        type: 'GENERAL_LEDGER',
        route: '/app/finance/general-ledger',
        sections: this.getSections('GENERAL_LEDGER'),
      },
    ];
  }

  getCards() {
    return this.getCatalog().map((statement) => ({
      id: statement.type.toLowerCase(),
      label: statement.type.replaceAll('_', ' '),
      route: statement.route,
      sectionCount: statement.sections.length,
    }));
  }
}
