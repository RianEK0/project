import { Module } from '@nestjs/common';

import { AutomationRemindersController } from './automation-reminders.controller';

@Module({
  controllers: [AutomationRemindersController],
})
export class AutomationRemindersModule {}
