import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { cashAccountStatuses, cashAccountTypes } from '@nova/shared-types';

@ApiTags('Cash Accounts')
@Controller({
  path: 'cash-accounts',
  version: '1',
})
export class CashAccountsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: cashAccountStatuses,
      accountTypes: cashAccountTypes,
      controlPoints: ['OPENING_FLOAT', 'DAILY_COUNT', 'REIMBURSEMENT_CLEARING'],
    };
  }
}
