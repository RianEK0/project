import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AiCopilotService } from './ai-copilot.service';

@ApiTags('AI Copilot')
@Controller({
  path: 'ai-copilot',
  version: '1',
})
export class AiCopilotController {
  constructor(private readonly aiCopilotService: AiCopilotService) {}

  @Get()
  getFoundation() {
    return this.aiCopilotService.getFoundation();
  }

  @Post('preview')
  preview(@Body('prompt') prompt?: string) {
    return this.aiCopilotService.preview({ prompt });
  }
}
