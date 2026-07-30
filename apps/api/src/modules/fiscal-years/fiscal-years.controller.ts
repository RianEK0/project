import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { fiscalYearStatuses } from '@nova/shared-types';

@ApiTags('Fiscal Years')
@Controller({
  path: 'fiscal-years',
  version: '1',
})
export class FiscalYearsController {
  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: fiscalYearStatuses,
      closeChecklist: ['SUBLEDGER_REVIEW', 'JOURNAL_POSTING', 'FX_REVIEW', 'STATEMENT_DRAFT'],
    };
  }
}
