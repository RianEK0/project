import { Module } from '@nestjs/common';

import { PutawayController } from './putaway.controller';

@Module({
  controllers: [PutawayController],
})
export class PutawayModule {}
