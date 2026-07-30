import { Module } from '@nestjs/common';

import { AskFinanceController } from './ask-finance.controller';

@Module({
  controllers: [AskFinanceController],
})
export class AskFinanceModule {}
