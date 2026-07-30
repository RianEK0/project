import { Module } from '@nestjs/common';

import { WhatsappAutomationController } from './whatsapp-automation.controller';

@Module({
  controllers: [WhatsappAutomationController],
})
export class WhatsappAutomationModule {}
