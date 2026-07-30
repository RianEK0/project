import { Module } from '@nestjs/common';

import { ChartOfAccountsController } from './chart-of-accounts.controller';

@Module({
  controllers: [ChartOfAccountsController],
})
export class ChartOfAccountsModule {}
