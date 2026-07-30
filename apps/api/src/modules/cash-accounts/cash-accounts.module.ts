import { Module } from '@nestjs/common';

import { CashAccountsController } from './cash-accounts.controller';

@Module({
  controllers: [CashAccountsController],
})
export class CashAccountsModule {}
