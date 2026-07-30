import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { postingBatchStatuses } from '@nova/shared-types';

@ApiTags('Accounting Postings')
@Controller({
  path: 'accounting-postings',
  version: '1',
})
export class AccountingPostingsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: postingBatchStatuses,
      sources: ['MANUAL_JOURNAL', 'DEPRECIATION', 'BANK_CASH', 'SALES', 'PROCUREMENT'],
    };
  }
}
