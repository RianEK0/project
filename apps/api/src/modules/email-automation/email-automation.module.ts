import { Module } from '@nestjs/common';

import { EmailAutomationController } from './email-automation.controller';

@Module({
  controllers: [EmailAutomationController],
})
export class EmailAutomationModule {}
