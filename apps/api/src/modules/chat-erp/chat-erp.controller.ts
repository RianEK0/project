import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ChatErpOrchestrationService } from './chat-erp-orchestration.service';

@ApiTags('Chat ERP')
@Controller({
  path: 'chat-erp',
  version: '1',
})
export class ChatErpController {
  constructor(private readonly chatErpOrchestrationService: ChatErpOrchestrationService) {}

  @Get()
  listFoundation() {
    return {
      items: [],
      statuses: this.chatErpOrchestrationService.getStatuses(),
      conversationRoles: this.chatErpOrchestrationService.getConversationRoles(),
      insightTypes: this.chatErpOrchestrationService.getInsightTypes(),
      supportedDomains: this.chatErpOrchestrationService.getSupportedDomains(),
    };
  }

  @Get('route-preview')
  getRoutePreview() {
    return this.chatErpOrchestrationService.previewRoute({
      prompt: 'Ringkas risiko stok untuk item backorder dan sarankan langkah berikutnya.',
    });
  }
}
