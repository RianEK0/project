import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { accountNormalBalances, accountStatuses, accountTypes } from '@nova/shared-types';

@ApiTags('Chart Of Accounts')
@Controller({
  path: 'chart-of-accounts',
  version: '1',
})
export class ChartOfAccountsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      accountTypes,
      normalBalances: accountNormalBalances,
      statuses: accountStatuses,
      rootGroups: [
        { codePrefix: '1', label: 'Assets', accountType: 'ASSET' },
        { codePrefix: '2', label: 'Liabilities', accountType: 'LIABILITY' },
        { codePrefix: '3', label: 'Equity', accountType: 'EQUITY' },
        { codePrefix: '4', label: 'Revenue', accountType: 'REVENUE' },
        { codePrefix: '5', label: 'Expenses', accountType: 'EXPENSE' },
      ],
    };
  }
}
