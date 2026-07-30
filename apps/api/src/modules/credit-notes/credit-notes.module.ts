import { Module } from '@nestjs/common';

import { SalesReturnsModule } from '../sales-returns/sales-returns.module';
import { SalesReturnWorkflowService } from '../sales-returns/sales-return-workflow.service';
import { CreditNotesController } from './credit-notes.controller';

@Module({
  imports: [SalesReturnsModule],
  controllers: [CreditNotesController],
  providers: [SalesReturnWorkflowService],
})
export class CreditNotesModule {}
