import { Module } from '@nestjs/common';

import { AskCrmController } from './ask-crm.controller';

@Module({
  controllers: [AskCrmController],
})
export class AskCrmModule {}
