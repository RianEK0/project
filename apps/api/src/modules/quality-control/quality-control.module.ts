import { Module } from '@nestjs/common';

import { QualityControlController } from './quality-control.controller';

@Module({
  controllers: [QualityControlController],
})
export class QualityControlModule {}
