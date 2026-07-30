import { Module } from '@nestjs/common';

import { PackingController } from './packing.controller';

@Module({
  controllers: [PackingController],
})
export class PackingModule {}
