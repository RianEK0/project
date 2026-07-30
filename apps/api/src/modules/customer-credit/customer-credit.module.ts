import { Module } from '@nestjs/common';

import { CustomerCreditController } from './customer-credit.controller';
import { CustomerCreditService } from './customer-credit.service';

@Module({
  controllers: [CustomerCreditController],
  providers: [CustomerCreditService],
})
export class CustomerCreditModule {}
