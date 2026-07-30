import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { accountTypes } from '@nova/shared-types';

@ApiTags('General Ledger')
@Controller({
  path: 'general-ledger',
  version: '1',
})
export class GeneralLedgerController {
  @Get()
  getFoundation() {
    return {
      dimensions: ['ACCOUNT', 'COST_CENTER', 'FISCAL_PERIOD', 'CURRENCY'],
      accountTypes,
      cards: [
        {
          id: 'period-activity',
          label: 'Period Activity',
          route: '/app/finance/general-ledger',
        },
        {
          id: 'open-periods',
          label: 'Open Period Visibility',
          route: '/app/finance/fiscal-years',
        },
        {
          id: 'currency-view',
          label: 'Multi-Currency Reporting',
          route: '/app/finance/exchange-rates',
        },
      ],
    };
  }
}
