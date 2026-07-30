import { Module } from '@nestjs/common';

import { AiHrController } from './ai-hr.controller';

@Module({
  controllers: [AiHrController],
})
export class AiHrModule {}
