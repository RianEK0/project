import { Module } from '@nestjs/common';

import { AccountingPostingsController } from './accounting-postings.controller';

@Module({
  controllers: [AccountingPostingsController],
})
export class AccountingPostingsModule {}
