import { Module } from '@nestjs/common';

import { LowCodeBuilderController } from './low-code-builder.controller';
import { LowCodeBuilderService } from './low-code-builder.service';

@Module({
  controllers: [LowCodeBuilderController],
  providers: [LowCodeBuilderService],
})
export class LowCodeBuilderModule {}
