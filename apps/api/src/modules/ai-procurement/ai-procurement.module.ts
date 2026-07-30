import { Module } from '@nestjs/common';

import { AiProcurementController } from './ai-procurement.controller';

@Module({
  controllers: [AiProcurementController],
})
export class AiProcurementModule {}
