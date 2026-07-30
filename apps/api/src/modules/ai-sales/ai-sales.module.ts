import { Module } from '@nestjs/common';

import { AiSalesController } from './ai-sales.controller';

@Module({
  controllers: [AiSalesController],
})
export class AiSalesModule {}
