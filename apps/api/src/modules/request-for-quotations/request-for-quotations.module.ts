import { Module } from '@nestjs/common';

import { RequestForQuotationsController } from './request-for-quotations.controller';

@Module({
  controllers: [RequestForQuotationsController],
})
export class RequestForQuotationsModule {}
