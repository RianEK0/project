import { Module } from '@nestjs/common';

import { PickingController } from './picking.controller';

@Module({
  controllers: [PickingController],
})
export class PickingModule {}
