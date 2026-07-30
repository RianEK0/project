import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { FinancialStatementComposerService } from './financial-statement-composer.service';

@ApiTags('Financial Statements')
@Controller({
  path: 'financial-statements',
  version: '1',
})
export class FinancialStatementsController {
  constructor(
    private readonly financialStatementComposerService: FinancialStatementComposerService,
  ) {}

  @Get()
  getStatements() {
    return {
      types: this.financialStatementComposerService.getStatementTypes(),
      cards: this.financialStatementComposerService.getCards(),
    };
  }

  @Get('catalog')
  getCatalog() {
    return this.financialStatementComposerService.getCatalog();
  }
}
