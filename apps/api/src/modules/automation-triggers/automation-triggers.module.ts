import { Module } from '@nestjs/common';

import { AutomationTriggersController } from './automation-triggers.controller';

@Module({
  controllers: [AutomationTriggersController],
})
export class AutomationTriggersModule {}
