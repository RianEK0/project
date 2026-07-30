import { Module } from '@nestjs/common';

import { AskInventoryController } from './ask-inventory.controller';

@Module({
  controllers: [AskInventoryController],
})
export class AskInventoryModule {}
