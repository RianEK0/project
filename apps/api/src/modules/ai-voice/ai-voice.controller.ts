import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AiVoiceService } from './ai-voice.service';

@ApiTags('AI Voice')
@Controller({
  path: 'ai-voice',
  version: '1',
})
export class AiVoiceController {
  constructor(private readonly aiVoiceService: AiVoiceService) {}

  @Get()
  getFoundation() {
    return this.aiVoiceService.getFoundation();
  }

  @Post('execute-preview')
  executePreview(@Body('transcript') transcript?: string) {
    return this.aiVoiceService.executePreview({ transcript });
  }
}
