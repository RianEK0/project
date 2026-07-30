import { Module } from '@nestjs/common';

import { AiReportsController } from './ai-reports.controller';

@Module({
  controllers: [AiReportsController],
})
export class AiReportsModule {}
