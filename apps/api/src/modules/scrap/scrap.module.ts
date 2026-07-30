import { Module } from '@nestjs/common';

import { ScrapController } from './scrap.controller';

@Module({
  controllers: [ScrapController],
})
export class ScrapModule {}
