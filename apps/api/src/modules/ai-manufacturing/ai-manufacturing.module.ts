import { Module } from '@nestjs/common';

import { AiManufacturingController } from './ai-manufacturing.controller';

@Module({
  controllers: [AiManufacturingController],
})
export class AiManufacturingModule {}
