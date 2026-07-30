import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { accountingVoucherStatuses, journalEntryStatuses } from '@nova/shared-types';

import { JournalPostingService } from './journal-posting.service';

@ApiTags('Journals')
@Controller({
  path: 'journals',
  version: '1',
})
export class JournalsController {
  constructor(private readonly journalPostingService: JournalPostingService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: journalEntryStatuses,
      voucherStatuses: accountingVoucherStatuses,
      balancingRule: 'TOTAL_DEBIT_EQUALS_TOTAL_CREDIT',
    };
  }

  @Get('metadata')
  getMetadata() {
    return {
      transitions: this.journalPostingService.getTransitionMatrix(),
      postableStatuses: this.journalPostingService.getPostableStatuses(),
      reversibleStatuses: this.journalPostingService.getReversibleStatuses(),
    };
  }
}
