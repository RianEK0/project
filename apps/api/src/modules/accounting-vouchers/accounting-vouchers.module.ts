import { Module } from '@nestjs/common';

import { AccountingVouchersController } from './accounting-vouchers.controller';

@Module({
  controllers: [AccountingVouchersController],
})
export class AccountingVouchersModule {}
