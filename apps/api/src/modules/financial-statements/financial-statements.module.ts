import { Module } from '@nestjs/common';

import { FinancialStatementComposerService } from './financial-statement-composer.service';
import { FinancialStatementsController } from './financial-statements.controller';

@Module({
  controllers: [FinancialStatementsController],
  providers: [FinancialStatementComposerService],
})
export class FinancialStatementsModule {}
