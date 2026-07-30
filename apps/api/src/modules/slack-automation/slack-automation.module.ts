import { Module } from '@nestjs/common';

import { SlackAutomationController } from './slack-automation.controller';

@Module({
  controllers: [SlackAutomationController],
})
export class SlackAutomationModule {}
