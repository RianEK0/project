import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { bankAccountStatuses, bankAccountTypes } from '@nova/shared-types';

@ApiTags('Bank Accounts')
@Controller({
  path: 'bank-accounts',
  version: '1',
})
export class BankAccountsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: bankAccountStatuses,
      accountTypes: bankAccountTypes,
      reconciliationModes: ['MANUAL', 'STATEMENT_IMPORT_READY'],
    };
  }
}
