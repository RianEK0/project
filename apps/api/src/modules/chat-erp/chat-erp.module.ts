import { Module } from '@nestjs/common';

import { ChatErpController } from './chat-erp.controller';
import { ChatErpOrchestrationService } from './chat-erp-orchestration.service';

@Module({
  controllers: [ChatErpController],
  providers: [ChatErpOrchestrationService],
})
export class ChatErpModule {}
