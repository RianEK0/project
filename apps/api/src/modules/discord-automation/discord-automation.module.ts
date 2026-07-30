import { Module } from '@nestjs/common';

import { DiscordAutomationController } from './discord-automation.controller';

@Module({
  controllers: [DiscordAutomationController],
})
export class DiscordAutomationModule {}
