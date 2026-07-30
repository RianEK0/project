import { Module } from '@nestjs/common';

import { BiBuilderController } from './bi-builder.controller';
import { BiBuilderService } from './bi-builder.service';

@Module({
  controllers: [BiBuilderController],
  providers: [BiBuilderService],
})
export class BiBuilderModule {}
