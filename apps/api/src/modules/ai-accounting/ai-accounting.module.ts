import { Module } from '@nestjs/common';

import { AiAccountingController } from './ai-accounting.controller';

@Module({
  controllers: [AiAccountingController],
})
export class AiAccountingModule {}
