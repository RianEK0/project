import { Module } from '@nestjs/common';

import { AutomationConditionsController } from './automation-conditions.controller';

@Module({
  controllers: [AutomationConditionsController],
})
export class AutomationConditionsModule {}
